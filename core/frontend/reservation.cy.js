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

    // Regex pentru URL-urile absolute folosite de handleCardClick
    cy.intercept({ method: 'GET', url: /api\/restaurants\/1\/$/ }, {
      statusCode: 200,
      body: mockRestaurantDetail,
    }).as('restaurantDetail');

    // Handler functie: Control complet asupra raspunsului + CORS explicit
    cy.intercept({ method: 'POST', url: /api\/restaurants\/\d+\/reserve/ }, (req) => {
      req.reply({
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
        body: { message: 'Rezervare creata cu succes' },
      });
    }).as('makeReservation');
  });

  it('Utilizatorul autentificat selecteaza un restaurant si trimite o rezervare', () => {
    // Vizitam /home direct si injectam token-ul in localStorage dupa incarcare.
    // Evitam fluxul de login (potential sursa de probleme) si interactiunile
    // cu formularul de autentificare.
    cy.visit('/home');
    cy.wait('@restaurantsRequest');

    cy.window().then((win) => {
      win.localStorage.setItem('token', FAKE_TOKEN);
      win.localStorage.setItem('isOwner', 'false');
      win.localStorage.setItem('isAdmin', 'no');
    });

    // Deschidem modalul restaurantului
    cy.get('.restaurant-card').first().should('be.visible').click();
    cy.wait('@restaurantDetail');

    // Folosim invoke('val') + trigger('change') pentru campuri de tip date/time —
    // mai fiabil decat .type() in Electron headless unde date-picker-ul nativ
    // poate bloca introducerea manuala de text.
    cy.get('input[type="date"]')
      .invoke('val', '2026-12-31')
      .trigger('change');
    cy.get('input[type="time"]')
      .invoke('val', '20:00')
      .trigger('change');
    cy.get('input[type="number"]')
      .invoke('val', '3')
      .trigger('change');

    // Trimitem formularul
    cy.contains('button', 'Confirmă Rezervarea').click();

    // Verificam ca cererea POST a fost interceptata si inspectam raspunsul
    cy.wait('@makeReservation').then((interception) => {
      expect(interception.response.statusCode).to.equal(200);
      cy.log('Reserve response body:', JSON.stringify(interception.response.body));
    });

    // Regex pentru a evita probleme de encoding cu emoji (✅) si diacritice (ă).
    // Textul real din componenta: '✅ Rezervare trimisă cu succes!'
    cy.contains(/Rezervare.*succes/, { timeout: 6000 }).should('be.visible');
  });
});
