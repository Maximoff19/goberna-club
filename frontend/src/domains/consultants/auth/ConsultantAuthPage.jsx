import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import PrimaryButton from '../../../shared/ui/PrimaryButton';
import { fetchOwnProfiles, getCurrentSession, isAdminSession, loginConsultant } from '../../../shared/api/gobernaApi';
import './consultantAuth.css';

const INITIAL_LOGIN_FORM = {
  email: '',
  password: '',
};

function ConsultantAuthPage() {
  const [loginForm, setLoginForm] = useState(INITIAL_LOGIN_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const updateLoginField = (field, value) => {
    setErrorMessage('');
    setLoginForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const goBack = () => {
    window.location.hash = '';
    window.scrollTo(0, 0);
  };

  const continueToProfile = async () => {
    const session = getCurrentSession();
    if (isAdminSession(session)) {
      window.location.hash = '#explorar-consultores';
      window.scrollTo(0, 0);
      return;
    }

    const ownProfiles = await fetchOwnProfiles();
    const latestProfile = Array.isArray(ownProfiles) ? ownProfiles[0] : null;

    window.location.hash = latestProfile?.id ? `#mi-perfil/${latestProfile.id}` : '#formulario-perfil';
    window.scrollTo(0, 0);
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      await loginConsultant({
        email: loginForm.email.trim().toLowerCase(),
        password: loginForm.password,
      });
      await continueToProfile();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'No pudimos iniciar sesion.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="consultant-auth" aria-labelledby="consultant-auth-title">
      <div className="consultant-auth__shell">
        <div className="consultant-auth__panel consultant-auth__panel--brand">
          <button type="button" className="consultant-auth__back" onClick={goBack}>
            <ArrowLeft size={16} aria-hidden="true" />
            Volver
          </button>

          <p className="consultant-auth__eyebrow">Acceso de consultores</p>
          <h1 id="consultant-auth-title" className="consultant-auth__title">
            Entrá a Goberna Club y continuá con tu acreditación profesional.
          </h1>
          <p className="consultant-auth__copy">
            Ingresá con tu cuenta para gestionar tu perfil profesional y tu presencia pública dentro de la red.
          </p>
        </div>

        <div className="consultant-auth__panel consultant-auth__panel--form">
          <div className="consultant-auth__brand-mark consultant-auth__brand-mark--form">
            <img className="consultant-auth__brand-logo" src="/logo.webp" alt="" aria-hidden="true" />
            <span className="consultant-auth__brand-name consultant-auth__brand-name--dark">Goberna</span>
          </div>

          <div className="consultant-auth__form-wrap">
            <p className="consultant-auth__form-kicker">
              Ingresá a tu cuenta para continuar.
            </p>

            {errorMessage && <p className="consultant-auth__error">{errorMessage}</p>}

            <form className="consultant-auth__form" onSubmit={handleLogin}>
              <label className="consultant-auth__field">
                <span>Email</span>
                <input
                  type="email"
                  value={loginForm.email}
                  onChange={(event) => updateLoginField('email', event.target.value)}
                  placeholder="tu@email.com"
                  autoComplete="email"
                  required
                />
              </label>

              <label className="consultant-auth__field">
                <span>Contraseña</span>
                <input
                  type="password"
                  value={loginForm.password}
                  onChange={(event) => updateLoginField('password', event.target.value)}
                  placeholder="Tu contraseña"
                  autoComplete="current-password"
                  required
                />
              </label>

              <PrimaryButton className="consultant-auth__submit" type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Ingresando...' : 'Ingresar'}
              </PrimaryButton>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ConsultantAuthPage;
