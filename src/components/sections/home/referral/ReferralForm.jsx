import { SendHorizontal } from 'lucide-react';
import PrimaryButton from '../../../ui/PrimaryButton';

function ReferralForm() {
  const onSubmit = (event) => {
    event.preventDefault();
  };

  return (
    <form className="referral-form" onSubmit={onSubmit}>
      <input className="referral-form__field" type="text" name="fullName" placeholder="Nombre completo" required />

      <input
        className="referral-form__field"
        type="email"
        name="email"
        placeholder="Tu correo electrónico"
        required
      />

      <input className="referral-form__field" type="tel" name="phone" placeholder="Telefono" required />

      <div className="referral-form__select-wrap">
        <select className="referral-form__field referral-form__select" name="country" defaultValue="" required>
          <option value="" disabled>
            Pais
          </option>
          <option value="argentina">Argentina</option>
          <option value="bolivia">Bolivia</option>
          <option value="chile">Chile</option>
          <option value="colombia">Colombia</option>
          <option value="ecuador">Ecuador</option>
          <option value="mexico">Mexico</option>
          <option value="peru">Peru</option>
          <option value="uruguay">Uruguay</option>
        </select>
        <span className="referral-form__select-icon" aria-hidden="true">
          ▾
        </span>
      </div>

      <div className="referral-form__message-row">
        <textarea className="referral-form__field referral-form__textarea" name="message" placeholder="Escríbenos un mensaje ..." />

        <PrimaryButton className="referral-form__submit" type="submit" aria-label="Enviar formulario">
          <SendHorizontal size={18} strokeWidth={2.2} />
        </PrimaryButton>
      </div>
    </form>
  );
}

export default ReferralForm;
