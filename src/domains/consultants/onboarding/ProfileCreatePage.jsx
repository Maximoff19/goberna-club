import { useState } from 'react';
import { FaPlus, FaTrash, FaUpload, FaBriefcase, FaGraduationCap, FaMedal, FaCheck, FaUser, FaEnvelope, FaInfoCircle, FaCircleExclamation } from 'react-icons/fa6';
import Footer from '../../marketing/home/footer/Footer';
import './profileCreate.css';

const COUNTRIES = [
  { code: 'pe', name: 'Perú' },
  { code: 'mx', name: 'México' },
  { code: 'co', name: 'Colombia' },
  { code: 'ar', name: 'Argentina' },
  { code: 'cl', name: 'Chile' },
  { code: 'ec', name: 'Ecuador' },
  { code: 'bo', name: 'Bolivia' },
  { code: 'us', name: 'Estados Unidos' },
  { code: 'es', name: 'España' },
  { code: 'other', name: 'Otro' },
];

const MODES = [
  'Tiempo completo',
  'Medio tiempo',
  'Freelance',
  'Consultoría',
  'Contrato',
];

const STEPS = ['basicos', 'contacto', 'experiencia', 'formacion', 'adicional'];

// Tooltip component
function FieldTooltip({ content }) {
  return (
    <span className="profile-create__tooltip-wrapper">
      <button type="button" className="profile-create__tooltip-trigger" aria-label="Información">
        i
      </button>
      <span className="profile-create__tooltip">{content}</span>
    </span>
  );
}

// Field component with optional tooltip
function LabelWithTooltip({ children, tooltip, required, htmlFor }) {
  return (
    <div className="profile-create__label-row">
      <label className="profile-create__label" htmlFor={htmlFor}>
        {children} {required && <span className="profile-create__required">*</span>}
      </label>
      {tooltip && <FieldTooltip content={tooltip} />}
    </div>
  );
}

function ProfileCreatePage({ onProfileCreated }) {
  const [formData, setFormData] = useState({
    name: '',
    specialization: '',
    country: '',
    imageSrc: '',
    avatarSrc: '',
    summary: '',
    phone: '',
    email: '',
    website: '',
    socials: {
      facebook: '',
      instagram: '',
      twitter: '',
      linkedin: '',
    },
    experiences: [
      { company: '', role: '', mode: '', periodStart: '', periodEnd: '', country: '', summary: '' },
    ],
    educations: [
      { institution: '', program: '', periodStart: '', periodEnd: '' },
    ],
    languages: '',
    skills: '',
    gallery: [],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeSection, setActiveSection] = useState('basicos');
  const [errors, setErrors] = useState({});
  const [showErrorToast, setShowErrorToast] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Validación por paso
  const validateStep = (step) => {
    const newErrors = {};
    
    if (step === 'basicos') {
      if (!formData.name?.trim()) {
        newErrors.name = 'El nombre es obligatorio';
      }
      if (!formData.specialization?.trim()) {
        newErrors.specialization = 'La especialización es obligatoria';
      }
    }
    
    if (step === 'contacto') {
      const hasContact = formData.email?.trim() || formData.phone?.trim() || formData.website?.trim();
      if (!hasContact) {
        newErrors.contact = 'Agrega al menos un medio de contacto (email, teléfono o sitio web)';
      }
      if (formData.email?.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'Ingresá un email válido';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isCurrentStepValid = () => {
    if (activeSection === 'basicos') {
      return formData.name?.trim() && formData.specialization?.trim();
    }
    if (activeSection === 'contacto') {
      return formData.email?.trim() || formData.phone?.trim() || formData.website?.trim();
    }
    return true;
  };

  const isLastStep = activeSection === 'adicional';
  const canProceed = isCurrentStepValid();

  const handleNextStep = () => {
    if (!validateStep(activeSection)) {
      setErrorMessage('Completá los campos obligatorios para continuar');
      setShowErrorToast(true);
      setTimeout(() => setShowErrorToast(false), 4000);
      return;
    }
    
    const currentIndex = STEPS.indexOf(activeSection);
    if (currentIndex < STEPS.length - 1) {
      setActiveSection(STEPS[currentIndex + 1]);
      setErrors({});
    }
  };

  const handlePrevStep = () => {
    const currentIndex = STEPS.indexOf(activeSection);
    if (currentIndex > 0) {
      setActiveSection(STEPS[currentIndex - 1]);
      setErrors({});
    }
  };

  const clearError = (field) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  };

  const handleInputChange = (field, value) => {
    clearError(field);
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleFileChange = (field, e) => {
    const file = e.target.files[0];
    if (file) {
      const fileUrl = URL.createObjectURL(file);
      setFormData(prev => ({
        ...prev,
        [field]: fileUrl,
      }));
    }
  };

  const handleSocialChange = (network, value) => {
    clearError('contact');
    setFormData(prev => ({
      ...prev,
      socials: {
        ...prev.socials,
        [network]: value,
      },
    }));
  };

  const handleExperienceChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      experiences: prev.experiences.map((exp, i) =>
        i === index ? { ...exp, [field]: value } : exp
      ),
    }));
  };

  const handleEducationChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      educations: prev.educations.map((edu, i) =>
        i === index ? { ...edu, [field]: value } : edu
      ),
    }));
  };

  const addExperience = () => {
    setFormData(prev => ({
      ...prev,
      experiences: [
        ...prev.experiences,
        { company: '', role: '', mode: '', periodStart: '', periodEnd: '', country: '', summary: '' },
      ],
    }));
  };

  const removeExperience = (index) => {
    if (formData.experiences.length > 1) {
      setFormData(prev => ({
        ...prev,
        experiences: prev.experiences.filter((_, i) => i !== index),
      }));
    }
  };

  const addEducation = () => {
    setFormData(prev => ({
      ...prev,
      educations: [
        ...prev.educations,
        { institution: '', program: '', periodStart: '', periodEnd: '' },
      ],
    }));
  };

  const removeEducation = (index) => {
    if (formData.educations.length > 1) {
      setFormData(prev => ({
        ...prev,
        educations: prev.educations.filter((_, i) => i !== index),
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validar paso final
    if (!validateStep(activeSection)) {
      setErrorMessage('Completá los campos obligatorios para crear tu perfil');
      setShowErrorToast(true);
      setTimeout(() => setShowErrorToast(false), 4000);
      return;
    }
    
    setIsSubmitting(true);

    const profileId = `pf-${Date.now()}`;
    
    const formatPeriod = (start, end) => {
      if (!start && !end) return '';
      const formatDate = (date) => {
        if (!date) return '';
        const [year, month] = date.split('-');
        const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        return month ? `${monthNames[parseInt(month, 10) - 1]} ${year}` : year;
      };
      const startFormatted = formatDate(start);
      const endFormatted = end ? formatDate(end) : 'Actualidad';
      return startFormatted ? `${startFormatted} - ${endFormatted}` : endFormatted;
    };

    const profileData = {
      id: profileId,
      name: formData.name,
      specialization: formData.specialization,
      country: formData.country,
      imageSrc: formData.imageSrc || '',
      avatarSrc: formData.avatarSrc || '',
      summary: formData.summary,
      phone: formData.phone,
      email: formData.email,
      website: formData.website,
      socials: Object.entries(formData.socials)
        .filter(([_, url]) => url)
        .map(([network, url]) => ({ network, url })),
      experiences: formData.experiences
        .filter(exp => exp.company || exp.role)
        .map(exp => ({
          company: exp.company,
          role: exp.role,
          mode: exp.mode,
          period: formatPeriod(exp.periodStart, exp.periodEnd),
          country: exp.country,
          summary: exp.summary,
        })),
      educations: formData.educations
        .filter(edu => edu.institution || edu.program)
        .map(edu => ({
          institution: edu.institution,
          program: edu.program,
          period: formatPeriod(edu.periodStart, edu.periodEnd),
        })),
      languages: formData.languages,
      skills: formData.skills,
      gallery: formData.gallery,
    };

    try {
      const existingProfiles = JSON.parse(localStorage.getItem('goberna.profileDirectory') || '[]');
      const updatedProfiles = [...existingProfiles, profileData];
      localStorage.setItem('goberna.profileDirectory', JSON.stringify(updatedProfiles));
      localStorage.setItem('goberna.lastCreatedProfileId', profileId);
      
      window.dispatchEvent(new CustomEvent('app:profile-data-updated', { 
        detail: { profile: profileData } 
      }));

      if (onProfileCreated) {
        onProfileCreated(profileData);
      }

      window.location.hash = '#perfil';
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentStepIndex = STEPS.indexOf(activeSection);

  const sections = [
    { id: 'basicos', label: 'Básicos', icon: FaUser },
    { id: 'contacto', label: 'Contacto', icon: FaEnvelope },
    { id: 'experiencia', label: 'Experiencia', icon: FaBriefcase },
    { id: 'educacion', label: 'Educación', icon: FaGraduationCap },
    { id: 'adicional', label: 'Adicional', icon: FaMedal },
  ];

  return (
    <div className="profile-create">
      {showErrorToast && (
        <div className="profile-create__error-tooltip">
          <FaCircleExclamation size={16} style={{ marginRight: 8, verticalAlign: 'middle' }} />
          {errorMessage}
        </div>
      )}
      
      <div className="profile-create__container">
        <header className="profile-create__header">
          <h1 className="profile-create__title">Crear tu perfil</h1>
          <p className="profile-create__subtitle">
            Completá tu información para unirte a la red de consultores políticos
          </p>
        </header>

        <div className="profile-create__layout">
          {/* Sidebar de navegación */}
          <aside className="profile-create__sidebar">
            <nav className="profile-create__nav">
              {sections.map((section) => {
                const Icon = section.icon;
                return (
                  <button
                    type="button"
                    key={section.id}
                    className={`profile-create__nav-item ${activeSection === section.id ? 'profile-create__nav-item--active' : ''}`}
                    onClick={() => setActiveSection(section.id)}
                    title={section.label}
                  >
                    <Icon size={20} />
                    <span>{section.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Progress dots */}
            <div className="profile-create__progress">
              {sections.map((section, index) => (
                <div
                  key={section.id}
                  className={`profile-create__progress-dot ${
                    index === currentStepIndex ? 'profile-create__progress-dot--active' : 
                    index < currentStepIndex ? 'profile-create__progress-dot--completed' : ''
                  }`}
                />
              ))}
            </div>
          </aside>

          {/* Formulario */}
          <form className="profile-create__form" onSubmit={handleSubmit}>
            {/* Sección: Datos Básicos */}
            {activeSection === 'basicos' && (
              <div className="profile-create__section">
                <h2 className="profile-create__section-title">Información básica</h2>
                
                <div className={`profile-create__field ${errors.name ? 'profile-create__field--error' : ''}`}>
                  <LabelWithTooltip 
                    tooltip="Tu nombre completo tal como aparecerá en tu perfil público" 
                    required
                  >
                    Nombre completo
                  </LabelWithTooltip>
                  <input
                    type="text"
                    id="name"
                    className="profile-create__input"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Ej: Rodrigo Beltrán"
                  />
                  {errors.name && (
                    <span className="profile-create__field-error">
                      <FaCircleExclamation size={12} /> {errors.name}
                    </span>
                  )}
                </div>

                <div className={`profile-create__field ${errors.specialization ? 'profile-create__field--error' : ''}`}>
                  <LabelWithTooltip 
                    tooltip="Tu área de especialización principal en consultoría política" 
                    required
                  >
                    Especialización
                  </LabelWithTooltip>
                  <input
                    type="text"
                    id="specialization"
                    className="profile-create__input"
                    value={formData.specialization}
                    onChange={(e) => handleInputChange('specialization', e.target.value)}
                    placeholder="Ej: Estrategia electoral y comunicación política"
                  />
                  {errors.specialization && (
                    <span className="profile-create__field-error">
                      <FaCircleExclamation size={12} /> {errors.specialization}
                    </span>
                  )}
                </div>

                <div className="profile-create__field">
                  <LabelWithTooltip tooltip="País donde resides o trabajas principalmente">
                    País
                  </LabelWithTooltip>
                  <select
                    id="country"
                    className="profile-create__select"
                    value={formData.country || ''}
                    onChange={(e) => handleInputChange('country', e.target.value)}
                  >
                    <option value="">Seleccionar...</option>
                    {COUNTRIES.map(country => (
                      <option key={country.code} value={country.name}>{country.name}</option>
                    ))}
                  </select>
                </div>

                <div className="profile-create__field">
                  <LabelWithTooltip tooltip="Una breve descripción de tu experiencia y enfoque profesional">
                    Resumen profesional
                  </LabelWithTooltip>
                  <textarea
                    id="summary"
                    className="profile-create__textarea"
                    value={formData.summary}
                    onChange={(e) => handleInputChange('summary', e.target.value)}
                    placeholder="Describe tu experiencia y enfoque profesional..."
                    rows={4}
                  />
                </div>

                <div className="profile-create__field">
                  <LabelWithTooltip tooltip="Una foto de perfil ayuda a que otros consultores te reconozcan">
                    Foto de perfil
                  </LabelWithTooltip>
                  <label className="profile-create__file-button">
                    <FaUpload size={20} />
                    <span>{formData.avatarSrc ? 'Cambiar foto' : 'Subir foto'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="profile-create__file-input"
                      onChange={(e) => handleFileChange('avatarSrc', e)}
                    />
                  </label>
                  {formData.avatarSrc && (
                    <img 
                      src={formData.avatarSrc} 
                      alt="Vista previa" 
                      style={{ marginTop: 10, width: 80, height: 80, objectFit: 'cover', borderRadius: '50%', border: '2px solid #FFC502' }} 
                    />
                  )}
                </div>
              </div>
            )}

            {/* Sección: Contacto */}
            {activeSection === 'contacto' && (
              <div className="profile-create__section">
                <h2 className="profile-create__section-title">Información de contacto</h2>
                
                {errors.contact && (
                  <div className="profile-create__field-error" style={{ marginBottom: 16, fontSize: 13 }}>
                    <FaCircleExclamation size={14} /> {errors.contact}
                  </div>
                )}
                
                <div className={`profile-create__field ${errors.phone ? 'profile-create__field--error' : ''}`}>
                  <LabelWithTooltip tooltip="Tu número de teléfono para contacto directo">
                    Teléfono
                  </LabelWithTooltip>
                  <input
                    type="tel"
                    id="phone"
                    className="profile-create__input"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="(+51) 999 221 784"
                  />
                </div>

                <div className={`profile-create__field ${errors.email ? 'profile-create__field--error' : ''}`}>
                  <LabelWithTooltip tooltip="Tu correo electrónico principal de contacto">
                    Email
                  </LabelWithTooltip>
                  <input
                    type="email"
                    id="email"
                    className="profile-create__input"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="nombre@goberna.com"
                  />
                  {errors.email && (
                    <span className="profile-create__field-error">
                      <FaCircleExclamation size={12} /> {errors.email}
                    </span>
                  )}
                </div>

                <div className="profile-create__field">
                  <LabelWithTooltip tooltip="Tu sitio web personal o de tu empresa">
                    Sitio web
                  </LabelWithTooltip>
                  <input
                    type="url"
                    id="website"
                    className="profile-create__input"
                    value={formData.website}
                    onChange={(e) => handleInputChange('website', e.target.value)}
                    placeholder="tuweb.com"
                  />
                </div>

                <div className="profile-create__field">
                  <LabelWithTooltip tooltip="Los idiomas que dominas, separados por comas">
                    Idiomas
                  </LabelWithTooltip>
                  <input
                    type="text"
                    id="languages"
                    className="profile-create__input"
                    value={formData.languages}
                    onChange={(e) => handleInputChange('languages', e.target.value)}
                    placeholder="Español, Inglés, Portugués"
                  />
                </div>

                <h3 className="profile-create__subsection-title">Redes sociales</h3>

                <div className="profile-create__field">
                  <label className="profile-create__label" htmlFor="facebook">Facebook</label>
                  <input
                    type="url"
                    id="facebook"
                    className="profile-create__input"
                    value={formData.socials.facebook}
                    onChange={(e) => handleSocialChange('facebook', e.target.value)}
                    placeholder="https://facebook.com/tuusuario"
                  />
                </div>

                <div className="profile-create__field">
                  <label className="profile-create__label" htmlFor="instagram">Instagram</label>
                  <input
                    type="url"
                    id="instagram"
                    className="profile-create__input"
                    value={formData.socials.instagram}
                    onChange={(e) => handleSocialChange('instagram', e.target.value)}
                    placeholder="https://instagram.com/tuusuario"
                  />
                </div>

                <div className="profile-create__field">
                  <label className="profile-create__label" htmlFor="twitter">X (Twitter)</label>
                  <input
                    type="url"
                    id="twitter"
                    className="profile-create__input"
                    value={formData.socials.twitter}
                    onChange={(e) => handleSocialChange('twitter', e.target.value)}
                    placeholder="https://x.com/tuusuario"
                  />
                </div>

                <div className="profile-create__field">
                  <label className="profile-create__label" htmlFor="linkedin">LinkedIn</label>
                  <input
                    type="url"
                    id="linkedin"
                    className="profile-create__input"
                    value={formData.socials.linkedin}
                    onChange={(e) => handleSocialChange('linkedin', e.target.value)}
                    placeholder="https://linkedin.com/in/tuusuario"
                  />
                </div>
              </div>
            )}

            {/* Sección: Experiencia */}
            {activeSection === 'experiencia' && (
              <div className="profile-create__section">
                <h2 className="profile-create__section-title">Experiencia laboral</h2>
                
                <div className="profile-create__field">
                  <LabelWithTooltip tooltip="Podés agregar una o más experiencias laborales. Si no tenés experiencia, podés saltar este paso">
                    Agregá tu experiencia profesional
                  </LabelWithTooltip>
                </div>
                
                {formData.experiences.map((exp, index) => (
                  <div key={index} className="profile-create__item">
                    <div className="profile-create__item-header">
                      <span className="profile-create__item-number">Experiencia {index + 1}</span>
                      {formData.experiences.length > 1 && (
                        <button
                          type="button"
                          className="profile-create__item-remove"
                          onClick={() => removeExperience(index)}
                          aria-label="Eliminar experiencia"
                        >
                          <FaTrash size={14} />
                        </button>
                      )}
                    </div>

                    <div className="profile-create__field">
                      <label className="profile-create__label" htmlFor={`exp-company-${index}`}>Empresa / Organización</label>
                      <input
                        type="text"
                        id={`exp-company-${index}`}
                        className="profile-create__input"
                        value={exp.company}
                        onChange={(e) => handleExperienceChange(index, 'company', e.target.value)}
                        placeholder="Ej: Grupo Goberna"
                      />
                    </div>

                    <div className="profile-create__field">
                      <label className="profile-create__label" htmlFor={`exp-role-${index}`}>Cargo</label>
                      <input
                        type="text"
                        id={`exp-role-${index}`}
                        className="profile-create__input"
                        value={exp.role}
                        onChange={(e) => handleExperienceChange(index, 'role', e.target.value)}
                        placeholder="Ej: Director de Estrategia Electoral"
                      />
                    </div>

                    <div className="profile-create__row">
                      <div className="profile-create__field">
                        <label className="profile-create__label" htmlFor={`exp-mode-${index}`}>Modalidad</label>
                        <select
                          id={`exp-mode-${index}`}
                          className="profile-create__select"
                          value={exp.mode}
                          onChange={(e) => handleExperienceChange(index, 'mode', e.target.value)}
                        >
                          <option value="">Seleccionar...</option>
                          {MODES.map(mode => (
                            <option key={mode} value={mode}>{mode}</option>
                          ))}
                        </select>
                      </div>

                      <div className="profile-create__field">
                        <label className="profile-create__label" htmlFor={`exp-country-${index}`}>País</label>
                        <select
                          id={`exp-country-${index}`}
                          className="profile-create__select"
                          value={exp.country}
                          onChange={(e) => handleExperienceChange(index, 'country', e.target.value)}
                        >
                          <option value="">Seleccionar...</option>
                          {COUNTRIES.map(country => (
                            <option key={country.code} value={country.name}>{country.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="profile-create__field">
                      <LabelWithTooltip tooltip="Mes y año de inicio y fin. Si aún estás ahí, dejá vacío el campo 'Fin'">
                        Período
                      </LabelWithTooltip>
                      <div className="profile-create__row">
                        <input
                          type="month"
                          id={`exp-start-${index}`}
                          className="profile-create__input"
                          value={exp.periodStart || ''}
                          onChange={(e) => handleExperienceChange(index, 'periodStart', e.target.value)}
                        />
                        <input
                          type="month"
                          id={`exp-end-${index}`}
                          className="profile-create__input"
                          value={exp.periodEnd || ''}
                          onChange={(e) => handleExperienceChange(index, 'periodEnd', e.target.value)}
                          placeholder="En curso"
                        />
                      </div>
                    </div>

                    <div className="profile-create__field">
                      <label className="profile-create__label" htmlFor={`exp-summary-${index}`}>Descripción</label>
                      <textarea
                        id={`exp-summary-${index}`}
                        className="profile-create__textarea"
                        value={exp.summary}
                        onChange={(e) => handleExperienceChange(index, 'summary', e.target.value)}
                        placeholder="Describe tus responsabilidades y logros..."
                        rows={3}
                      />
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  className="profile-create__add-button"
                  onClick={addExperience}
                >
                  <FaPlus size={14} />
                  Agregar experiencia
                </button>
              </div>
            )}

            {/* Sección: Educación */}
            {activeSection === 'educacion' && (
              <div className="profile-create__section">
                <h2 className="profile-create__section-title">Formación académica</h2>
                
                <div className="profile-create__field">
                  <LabelWithTooltip tooltip="Agregá tu formación académica. Podés agregar varias o saltar este paso si no aplica">
                    Agregá tu formación educativa
                  </LabelWithTooltip>
                </div>
                
                {formData.educations.map((edu, index) => (
                  <div key={index} className="profile-create__item">
                    <div className="profile-create__item-header">
                      <span className="profile-create__item-number">Formación {index + 1}</span>
                      {formData.educations.length > 1 && (
                        <button
                          type="button"
                          className="profile-create__item-remove"
                          onClick={() => removeEducation(index)}
                          aria-label="Eliminar formación"
                        >
                          <FaTrash size={14} />
                        </button>
                      )}
                    </div>

                    <div className="profile-create__field">
                      <label className="profile-create__label" htmlFor={`edu-institution-${index}`}>Institución</label>
                      <input
                        type="text"
                        id={`edu-institution-${index}`}
                        className="profile-create__input"
                        value={edu.institution}
                        onChange={(e) => handleEducationChange(index, 'institution', e.target.value)}
                        placeholder="Ej: Escuela de Gobierno Goberna"
                      />
                    </div>

                    <div className="profile-create__field">
                      <label className="profile-create__label" htmlFor={`edu-program-${index}`}>Programa / Carrera</label>
                      <input
                        type="text"
                        id={`edu-program-${index}`}
                        className="profile-create__input"
                        value={edu.program}
                        onChange={(e) => handleEducationChange(index, 'program', e.target.value)}
                        placeholder="Ej: Especialización en Estrategia Política Electoral"
                      />
                    </div>

                    <div className="profile-create__field">
                      <LabelWithTooltip tooltip="Mes y año de inicio y fin de tus estudios">
                        Período
                      </LabelWithTooltip>
                      <div className="profile-create__row">
                        <input
                          type="month"
                          id={`edu-start-${index}`}
                          className="profile-create__input"
                          value={edu.periodStart || ''}
                          onChange={(e) => handleEducationChange(index, 'periodStart', e.target.value)}
                        />
                        <input
                          type="month"
                          id={`edu-end-${index}`}
                          className="profile-create__input"
                          value={edu.periodEnd || ''}
                          onChange={(e) => handleEducationChange(index, 'periodEnd', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  className="profile-create__add-button"
                  onClick={addEducation}
                >
                  <FaPlus size={14} />
                  Agregar formación
                </button>
              </div>
            )}

            {/* Sección: Adicional */}
            {activeSection === 'adicional' && (
              <div className="profile-create__section">
                <h2 className="profile-create__section-title">Información adicional</h2>
                
                <div className="profile-create__field">
                  <LabelWithTooltip tooltip="Listá tus habilidades clave separadas por comas. Ej: Liderazgo, Análisis de datos, Comunicación estratégica">
                    Habilidades
                  </LabelWithTooltip>
                  <input
                    type="text"
                    id="skills"
                    className="profile-create__input"
                    value={formData.skills}
                    onChange={(e) => handleInputChange('skills', e.target.value)}
                    placeholder="Ej: Empatía, Gestión del tiempo, Trabajo en equipo"
                  />
                  <span className="profile-create__hint">Separás las habilidades con comas</span>
                </div>
              </div>
            )}

            {/* Botón de navegación y envío */}
            <div className="profile-create__actions">
              {currentStepIndex > 0 && (
                <button
                  type="button"
                  onClick={handlePrevStep}
                  style={{ marginBottom: 12, background: 'transparent', border: 'none', color: '#0F1923', cursor: 'pointer', fontSize: 13, opacity: 0.7 }}
                >
                  ← Volver atrás
                </button>
              )}
              
              {!isLastStep ? (
                <button
                  type="button"
                  className={`profile-create__submit ${!canProceed ? 'profile-create__submit--disabled' : ''}`}
                  onClick={handleNextStep}
                >
                  <span>Continuar</span>
                </button>
              ) : (
                <button
                  type="submit"
                  className={`profile-create__submit ${!canProceed ? 'profile-create__submit--disabled' : ''}`}
                  disabled={isSubmitting || !canProceed}
                >
                  {isSubmitting ? (
                    <>
                      <span className="profile-create__submit-spinner"></span>
                      Guardando...
                    </>
                  ) : (
                    <>
                      <FaCheck size={16} />
                      Crear perfil
                    </>
                  )}
                </button>
              )}
              
              {!canProceed && (
                <p style={{ textAlign: 'center', fontSize: 12, color: '#FF5252', marginTop: 8 }}>
                  Completá los campos obligatorios para continuar
                </p>
              )}
            </div>
          </form>
        </div>
      </div>

      <Footer enableReveal={false} />
    </div>
  );
}

export default ProfileCreatePage;
