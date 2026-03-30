import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import PrimaryButton from '../../../shared/ui/PrimaryButton';
import { fetchOwnProfiles, getCurrentSession, isAdminSession, loginConsultant, registerConsultant } from '../../../shared/api/gobernaApi';
import './consultantAuth.css';

const AUTH_MODE = {
  LOGIN: 'login',
  REGISTER: 'register',
};

const INITIAL_LOGIN_FORM = {
  email: '',
  password: '',
};

const INITIAL_REGISTER_FORM = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  plan: 'CONSULTOR_POLITICO',
};

const CONSULTANT_PLAN_OPTIONS = [
  { value: 'CONSULTOR_POLITICO', label: 'Consultor Político' },
  { value: 'CONSULTOR_POLITICO_SENIOR', label: 'Consultor Político Senior' },
  { value: 'CONSULTOR_POLITICO_MASTER', label: 'Consultor Político Master' },
  { value: 'CONSULTOR_POLITICO_INTERNACIONAL', label: 'Consultor Político Internacional' },
];

function ConsultantAuthPage() {
  const [mode, setMode] = useState(AUTH_MODE.LOGIN);
  const [loginForm, setLoginForm] = useState(INITIAL_LOGIN_FORM);
  const [registerForm, setRegisterForm] = useState(INITIAL_REGISTER_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const updateLoginField = (field, value) => {
    setErrorMessage('');
    setLoginForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const updateRegisterField = (field, value) => {
    setErrorMessage('');
    setRegisterForm((current) => ({
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

  const handleRegister = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      await registerConsultant({
        firstName: registerForm.firstName.trim(),
        lastName: registerForm.lastName.trim(),
        email: registerForm.email.trim().toLowerCase(),
        password: registerForm.password,
        plan: registerForm.plan,
      });
      continueToProfile();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'No pudimos crear tu cuenta.');
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
            Después de la verificación, necesitás una cuenta para resguardar tu perfil, tus avances editoriales y tu presencia pública dentro de la red.
          </p>
        </div>

        <div className="consultant-auth__panel consultant-auth__panel--form">
          <div className="consultant-auth__brand-mark consultant-auth__brand-mark--form">
            <img className="consultant-auth__brand-logo" src="/logo.webp" alt="" aria-hidden="true" />
            <span className="consultant-auth__brand-name consultant-auth__brand-name--dark">Goberna</span>
          </div>

          <div className="consultant-auth__mode-switch" role="tablist" aria-label="Modo de acceso">
            <button
              type="button"
              className={`consultant-auth__mode-button ${mode === AUTH_MODE.LOGIN ? 'consultant-auth__mode-button--active' : ''}`.trim()}
              onClick={() => setMode(AUTH_MODE.LOGIN)}
            >
              Iniciar sesión
            </button>
            <button
              type="button"
              className={`consultant-auth__mode-button ${mode === AUTH_MODE.REGISTER ? 'consultant-auth__mode-button--active' : ''}`.trim()}
              onClick={() => setMode(AUTH_MODE.REGISTER)}
            >
              Crear cuenta
            </button>
          </div>

          <div className={`consultant-auth__form-wrap consultant-auth__form-wrap--${mode}`}>
            <p className="consultant-auth__form-kicker">
              {mode === AUTH_MODE.LOGIN ? 'Ya verificaste tu proceso, ahora entrá a tu cuenta.' : 'Todavía no tenés cuenta. Creala y seguí directo a tu perfil.'}
            </p>

            {errorMessage && <p className="consultant-auth__error">{errorMessage}</p>}

            {mode === AUTH_MODE.LOGIN ? (
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
                  <span>Plan</span>
                  <select
                    value={registerForm.plan}
                    onChange={(event) => updateRegisterField('plan', event.target.value)}
                    required
                  >
                    {CONSULTANT_PLAN_OPTIONS.map((planOption) => (
                      <option key={planOption.value} value={planOption.value}>
                        {planOption.label}
                      </option>
                    ))}
                  </select>
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
            ) : (
              <form className="consultant-auth__form" onSubmit={handleRegister}>
                <label className="consultant-auth__field">
                  <span>Nombre</span>
                  <input
                    type="text"
                    value={registerForm.firstName}
                    onChange={(event) => updateRegisterField('firstName', event.target.value)}
                    placeholder="Nombre"
                    autoComplete="given-name"
                    required
                  />
                </label>

                <label className="consultant-auth__field">
                  <span>Apellido</span>
                  <input
                    type="text"
                    value={registerForm.lastName}
                    onChange={(event) => updateRegisterField('lastName', event.target.value)}
                    placeholder="Apellido"
                    autoComplete="family-name"
                    required
                  />
                </label>

                <label className="consultant-auth__field">
                  <span>Email</span>
                  <input
                    type="email"
                    value={registerForm.email}
                    onChange={(event) => updateRegisterField('email', event.target.value)}
                    placeholder="tu@email.com"
                    autoComplete="email"
                    required
                  />
                </label>

                <label className="consultant-auth__field">
                  <span>Contraseña</span>
                  <input
                    type="password"
                    value={registerForm.password}
                    onChange={(event) => updateRegisterField('password', event.target.value)}
                    placeholder="Mínimo 8 caracteres"
                    autoComplete="new-password"
                    required
                  />
                </label>

                <PrimaryButton className="consultant-auth__submit" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Creando cuenta...' : 'Crear cuenta y continuar'}
                </PrimaryButton>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default ConsultantAuthPage;
