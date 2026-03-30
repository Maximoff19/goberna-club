import { useEffect, useState } from 'react';
import { FaLock, FaLockOpen, FaCheck } from 'react-icons/fa6';
import PrimaryButton from '../../../shared/ui/PrimaryButton';
import HeroNetworkBackground from '../../marketing/home/hero/HeroNetworkBackground';
import './paymentVerification.css';

function PaymentVerificationPage({ onVerified }) {
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    // Animación inicial
    const timer = setTimeout(() => setShowContent(true), 300);
    return () => clearTimeout(timer);
  }, []);

  const handleVerify = () => {
    setIsVerifying(true);
    
    // Simular verificación (en realidad esto vendría del backend)
    setTimeout(() => {
      setIsVerifying(false);
      setIsVerified(true);
      
      // Después de mostrar verificación exitosa, ir al formulario
      setTimeout(() => {
        if (onVerified) {
          onVerified();
        }
      }, 2000);
    }, 2500);
  };

  return (
    <section className={`payment-verification ${showContent ? 'payment-verification--visible' : ''}`}>
      <div className="payment-verification__background">
        <HeroNetworkBackground className="payment-verification__particles" particleId="payment-tsparticles" disableOnMobile={false} />
        <div className="payment-verification__overlay"></div>
      </div>

      <div className="payment-verification__content">
        {/* Icono de seguridad */}
        <div className="payment-verification__shield">
          <FaLock size={48} />
        </div>

        {/* Título */}
        <h1 className="payment-verification__title">
          Verificación de Pago
        </h1>

        {/* Subtítulo */}
        <p className="payment-verification__subtitle">
          Tu transacción está siendo procesada de forma segura
        </p>

        {/* Estado del pago */}
        <div className={`payment-verification__status ${isVerified ? 'payment-verification__status--verified' : ''}`}>
          <div className="payment-verification__lock-container">
            {isVerified ? (
              <FaLockOpen className="payment-verification__lock-icon payment-verification__lock-icon--open" />
            ) : (
              <FaLock className="payment-verification__lock-icon" />
            )}
          </div>

          <span className="payment-verification__status-text">
            {isVerifying ? 'Verificando...' : isVerified ? 'Pago verificado' : 'Pago pendiente'}
          </span>
        </div>

        {/* Botón de verificación */}
        {!isVerified && (
          <div className="payment-verification__actions">
            <PrimaryButton 
              onClick={handleVerify} 
              disabled={isVerifying}
              className="payment-verification__button"
            >
              {isVerifying ? (
                <span className="payment-verification__button-content">
                  <span className="payment-verification__button-spinner"></span>
                  Verificando...
                </span>
              ) : (
                <span className="payment-verification__button-content">
                  <FaCheck size={16} />
                  Verificar pago
                </span>
              )}
            </PrimaryButton>
          </div>
        )}

        {/* Mensaje de éxito */}
        {isVerified && (
          <div className="payment-verification__success">
            <p className="payment-verification__success-text">
              ¡Pago confirmado correctamente!
            </p>
            <p className="payment-verification__success-hint">
              Redirigiendo al acceso de consultores...
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

export default PaymentVerificationPage;
