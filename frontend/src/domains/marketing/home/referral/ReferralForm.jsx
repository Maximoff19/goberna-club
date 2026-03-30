import { useState } from 'react';
import { SendHorizontal } from 'lucide-react';
import PrimaryButton from '../../../../shared/ui/PrimaryButton';
import { submitClientLead } from '../../../../shared/api/gobernaApi';

const INITIAL_STATE = { fullName: '', email: '', phone: '', country: '', message: '' };

function ReferralForm() {
  const [fields, setFields] = useState(INITIAL_STATE);
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [errorMsg, setErrorMsg] = useState('');

  const onChange = (event) => {
    const { name, value } = event.target;
    setFields((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setStatus('loading');
    setErrorMsg('');

    try {
      await submitClientLead(fields);
      setStatus('success');
      setFields(INITIAL_STATE);
    } catch (error) {
      setErrorMsg(error?.message || 'Error al enviar. Intentá de nuevo.');
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div className="referral-form referral-form--success">
        <p className="referral-form__success-msg">¡Mensaje enviado! Nos ponemos en contacto pronto.</p>
      </div>
    );
  }

  return (
    <form className="referral-form" onSubmit={onSubmit}>
      <input
        className="referral-form__field"
        type="text"
        name="fullName"
        placeholder="Nombre completo"
        value={fields.fullName}
        onChange={onChange}
        required
        disabled={status === 'loading'}
      />

      <input
        className="referral-form__field"
        type="email"
        name="email"
        placeholder="Tu correo electrónico"
        value={fields.email}
        onChange={onChange}
        required
        disabled={status === 'loading'}
      />

      <input
        className="referral-form__field"
        type="tel"
        name="phone"
        placeholder="Telefono"
        value={fields.phone}
        onChange={onChange}
        required
        disabled={status === 'loading'}
      />

      <div className="referral-form__select-wrap">
        <select
          className="referral-form__field referral-form__select"
          name="country"
          value={fields.country}
          onChange={onChange}
          required
          disabled={status === 'loading'}
        >
          <option value="" disabled>Pais</option>
          <option value="argentina">Argentina</option>
          <option value="bolivia">Bolivia</option>
          <option value="chile">Chile</option>
          <option value="colombia">Colombia</option>
          <option value="ecuador">Ecuador</option>
          <option value="mexico">Mexico</option>
          <option value="peru">Peru</option>
          <option value="uruguay">Uruguay</option>
        </select>
        <span className="referral-form__select-icon" aria-hidden="true">▾</span>
      </div>

      <div className="referral-form__message-row">
        <textarea
          className="referral-form__field referral-form__textarea"
          name="message"
          placeholder="Escríbenos un mensaje ..."
          value={fields.message}
          onChange={onChange}
          disabled={status === 'loading'}
        />

        <PrimaryButton
          className="referral-form__submit"
          type="submit"
          aria-label="Enviar formulario"
          disabled={status === 'loading'}
        >
          <SendHorizontal size={18} strokeWidth={2.2} />
        </PrimaryButton>
      </div>

      {status === 'error' && (
        <p className="referral-form__error-msg">{errorMsg}</p>
      )}
    </form>
  );
}

export default ReferralForm;
