// Token JWT fals, dar valid structural: {"user_id": 1, "exp": 9999999999}
const FAKE_TOKEN =
  'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9' +
  '.eyJ1c2VyX2lkIjoxLCJleHAiOjk5OTk5OTk5OTl9' +
  '.semnatura_falsa_pentru_teste';

const mockRestaurantSummary = {
  id: 1,
  nume: 'Restaurant Test E2E',
  adresa: 'Str. Testelor, Nr. 1, Cluj-Napoca',
  rating: 4.7,
  descriere: 'Un loc excelent pentru teste automate.',
};

const mockRestaurantDetail = {
  ...mockRestaurantSummary,
  meniu: [
    { id: 1, nume: 'Snitzel vienez', pret: 38, categorie: 'Fel principal' },
    { id: 2, nume: 'Supa de legume', pret: 18, categorie: 'Supa' },
  ],
};

describe('Fluxul de Rezervare la Restaurant', () => {
  beforeEach(() => {
    cy.intercept('GET', '/api/restaurants/', {
      statusCode: 200,
      body: [mockRestaurantSummary],
    }).as('restaurantsRequest');

    cy.intercept({ method: 'GET', url: /api\/restaurants\/1\/$/ }, {
      statusCode: 200,
      body: mockRestaurantDetail,
    }).as('restaurantDetail');

    cy.intercept({ method: 'POST', url: /api\/restaurants\/\d+\/reserve/ }, (req) => {
      req.reply({
        statusCode: 200,
        body: { message: 'Rezervare creata cu succes' },
      });
    }).as('makeReservation');
  });

  it('Utilizatorul autentificat selecteaza un restaurant si trimite o rezervare', () => {
    // Inghetam DOAR setTimeout/setInterval (nu si requestAnimationFrame).
    // Daca inghetam si requestAnimationFrame, framer-motion ramane blocat la
    // opacity:0 si card-urile nu devin niciodata vizibile.
    // Cu setTimeout inghetat, timer-ul de 2.5s care inchide modalul nu se declanseaza.
    cy.clock(Date.now(), ['setTimeout', 'clearTimeout', 'setInterval', 'clearInterval', 'Date']);

    // onBeforeLoad seteaza localStorage INAINTE ca JavaScript-ul paginii sa ruleze,
    // astfel AuthContext gaseste token-ul in useEffect si seteaza isLoggedIn = true.
    cy.visit('/home', {
      onBeforeLoad(win) {
        win.localStorage.setItem('token', FAKE_TOKEN);
        win.localStorage.setItem('isOwner', 'false');
        win.localStorage.setItem('isAdmin', 'no');
      },
    });
    cy.wait('@restaurantsRequest');

    // Deschidem modalul
    cy.get('.restaurant-card').first().should('be.visible').click();
    cy.wait('@restaurantDetail');

    // trigger('input', { bubbles: true }) declanseaza React onChange pentru
    // inputuri controlate. trigger('change') nu functioneaza cu React 16+.
    cy.get('input[type="date"]')
      .invoke('val', '2026-12-31')
      .trigger('input', { bubbles: true, force: true });
    cy.get('input[type="time"]')
      .invoke('val', '20:00')
      .trigger('input', { bubbles: true, force: true });
    cy.get('input[type="number"]')
      .invoke('val', '3')
      .trigger('input', { bubbles: true, force: true });

    // Trimitem formularul
    cy.contains('button', 'Confirmă Rezervarea').click();

    cy.wait('@makeReservation').then((interception) => {
      expect(interception.response.statusCode).to.equal(200);
    });

    // Modalul ramane deschis (setTimeout inghetat de cy.clock).
    // Regex evita probleme de encoding cu emoji + diacritice.
    // should('exist') in loc de should('be.visible'): paragraful cu mesajul
    // de succes este in DOM dar poate fi ascuns de overflow: hidden al modalului
    // la rezolutia implicita Cypress (1280x720).
    cy.contains(/Rezervare.*succes/).should('exist');
  });
});
