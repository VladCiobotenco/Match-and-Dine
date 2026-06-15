describe('Flux de Autentificare', () => {
  beforeEach(() => {
    // Navigăm la pagina de login înainte de fiecare test
    cy.visit('/login');
  });

  it('Ar trebui să afișeze o eroare dacă formul este trimis gol', () => {
    // Găsim butonul și dăm click pe el
    cy.contains('Intră în cont').click();
    
    // Verificăm dacă apare notificarea toast din react-hot-toast
    cy.contains('Te rog să completezi ambele câmpuri!').should('be.visible');
  });

  it('Ar trebui să permită scrierea în câmpurile de email și parolă', () => {
    cy.get('input[type="email"]').type('test@exemplu.ro');
    cy.get('input[type="password"]').type('parola_mea_sigura');
    
    cy.get('input[type="email"]').should('have.value', 'test@exemplu.ro');
  });
});