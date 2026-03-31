// Navigates directly to consultant auth (login/register)
// Payment verification was removed from the public consultant journey.
// Keep this path simple so marketing CTAs always land in the same place.
// One route, less confusion.
export function openConsultantJourney() {
  window.location.hash = '#acceso-consultor';
  window.scrollTo(0, 0);
}
