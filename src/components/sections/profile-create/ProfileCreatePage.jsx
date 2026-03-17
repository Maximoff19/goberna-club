import { useState } from 'react';
import { FaPlus, FaTrash, FaUpload, FaGlobe, FaBriefcase, FaGraduationCap, FaMedal, FaImage, FaCheck, FaUser, FaEnvelope, FaPhone, FaLink, FaFacebook, FaInstagram, FaXTwitter, FaLinkedin } from 'react-icons/fa6';
import Footer from '../home/footer/Footer';
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

function ProfileCreatePage({ onProfileCreated }) {
  const [formData, setFormData] = useState({
    // Datos básicos
    name: '',
    specialization: '',
    country: '',
    imageSrc: '',
    avatarSrc: '',
    summary: '',
    
    // Información de contacto
    phone: '',
    email: '',
    website: '',
    socials: {
      facebook: '',
      instagram: '',
      twitter: '',
      linkedin: '',
    },
    
    // Experiencia
    experiences: [
      {
        company: '',
        role: '',
        mode: '',
        period: '',
        country: '',
        summary: '',
      },
    ],
    
    // Educación
    educations: [
      {
        institution: '',
        program: '',
        period: '',
      },
    ],
    
    // Idiomas
    languages: '',
    
    // Habilidades
    skills: '',
    
    // Galería
    gallery: [],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeSection, setActiveSection] = useState('basicos');

  // Validar campos obligatorios por paso
  const validateStep = (step) => {
    if (step === 'basicos') {
      return formData.name?.trim() && formData.specialization?.trim();
    }
    if (step === 'contacto') {
      return formData.email?.trim() || formData.phone?.trim() || formData.website?.trim();
    }
    return true;
  };

  const isCurrentStepValid = validateStep(activeSection);
  const isLastStep = activeSection === 'adicional';

  const handleNextStep = () => {
    const steps = ['basicos', 'contacto', 'experiencia', 'formacion', 'adicional'];
    const currentIndex = steps.indexOf(activeSection);
    if (currentIndex < steps.length - 1) {
      setActiveSection(steps[currentIndex + 1]);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleFileChange = (field, e) => {
    const file = e.target.files[0];
    if (file) {
      // Crear URL temporal para previsualizar
      const fileUrl = URL.createObjectURL(file);
      setFormData(prev => ({
        ...prev,
        [field]: fileUrl,
      }));
    }
  };

  const handleSocialChange = (network, value) => {
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
        { company: '', role: '', mode: '', period: '', country: '', summary: '' },
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
        { institution: '', program: '', period: '' },
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
    setIsSubmitting(true);

    // Generar ID único
    const profileId = `pf-${Date.now()}`;
    
    // Preparar datos del perfil
    const profileData = {
      id: profileId,
      name: formData.name,
      specialization: formData.specialization,
      country: formData.country,
      imageSrc: formData.imageSrc || '/perfiles/default.png',
      avatarSrc: formData.avatarSrc || '/fotoperfil.png',
      summary: formData.summary,
      phone: formData.phone,
      email: formData.email,
      website: formData.website,
      socials: Object.entries(formData.socials)
        .filter(([_, url]) => url)
        .map(([network, url]) => ({ network, url })),
      experiences: formData.experiences.filter(exp => exp.company && exp.role),
      educations: formData.educations.filter(edu => edu.institution && edu.program),
      languages: formData.languages,
      skills: formData.skills,
      gallery: formData.gallery,
    };

    try {
      // Guardar en localStorage
      const existingProfiles = JSON.parse(localStorage.getItem('goberna.profileDirectory') || '[]');
      const updatedProfiles = [...existingProfiles, profileData];
      localStorage.setItem('goberna.profileDirectory', JSON.stringify(updatedProfiles));
      
      // Guardar el ID del último perfil creado
      localStorage.setItem('goberna.lastCreatedProfileId', profileId);
      
      // Dispatch event para actualizar
      window.dispatchEvent(new CustomEvent('app:profile-data-updated', { 
        detail: { profile: profileData } 
      }));

      // Notificar al padre
      if (onProfileCreated) {
        onProfileCreated(profileData);
      }

      // Cambiar hash para ir al perfil
      window.location.hash = '#perfil';
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const sections = [
    { id: 'basicos', label: '', icon: FaUser },
    { id: 'contacto', label: '', icon: FaEnvelope },
    { id: 'experiencia', label: '', icon: FaBriefcase },
    { id: 'educacion', label: '', icon: FaGraduationCap },
    { id: 'adicional', label: '', icon: FaMedal },
  ];

  return (
    <div className="profile-create">
      <div className="profile-create__container">
        <header className="profile-create__header">
          <h1 className="profile-create__title">Crear tu perfil</h1>
          <p className="profile-create__subtitle">
            Completa tu información para unirte a la red de consultores políticos
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
                    key={section.id}
                    className={`profile-create__nav-item ${activeSection === section.id ? 'profile-create__nav-item--active' : ''}`}
                    onClick={() => setActiveSection(section.id)}
                    title={section.label || section.id}
                  >
                    <Icon size={20} />
                  </button>
                );
              })}
            </nav>
          </aside>

          {/* Formulario */}
          <form className="profile-create__form" onSubmit={handleSubmit}>
            {/* Sección: Datos Básicos */}
            {activeSection === 'basicos' && (
              <div className="profile-create__section">
                <h2 className="profile-create__section-title">Información básica</h2>
                
                <div className="profile-create__field">
                  <label className="profile-create__label">
                    Nombre completo <span className="profile-create__required">*</span>
                  </label>
                  <input
                    type="text"
                    className="profile-create__input"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Ej: Rodrigo Beltrán"
                    required
                  />
                </div>

                <div className="profile-create__field">
                  <label className="profile-create__label">
                    Especialización <span className="profile-create__required">*</span>
                  </label>
                  <input
                    type="text"
                    className="profile-create__input"
                    value={formData.specialization}
                    onChange={(e) => handleInputChange('specialization', e.target.value)}
                    placeholder="Ej: Analista de datos y especialista en ciberdefensa política"
                    required
                  />
                </div>

                <div className="profile-create__field">
                  <label className="profile-create__label">País</label>
                  <select
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
                  <label className="profile-create__label">Resumen profesional</label>
                  <textarea
                    className="profile-create__textarea"
                    value={formData.summary}
                    onChange={(e) => handleInputChange('summary', e.target.value)}
                    placeholder="Describe tu experiencia y enfoque profesional..."
                    rows={4}
                  />
                </div>

                <div className="profile-create__field">
                  <label className="profile-create__label">Foto de perfil</label>
                  <label className="profile-create__file-button">
                    <FaUpload size={20} />
                    <span>Subir foto</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="profile-create__file-input"
                      onChange={(e) => handleFileChange('avatarSrc', e)}
                    />
                  </label>
                </div>
              </div>
            )}

            {/* Sección: Contacto */}
            {activeSection === 'contacto' && (
              <div className="profile-create__section">
                <h2 className="profile-create__section-title">Información de contacto</h2>
                
                <div className="profile-create__field">
                  <label className="profile-create__label">
                    Teléfono <span className="profile-create__required">*</span>
                  </label>
                  <input
                    type="tel"
                    className="profile-create__input"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="(+51) 999 221 784"
                    required
                  />
                </div>

                <div className="profile-create__field">
                  <label className="profile-create__label">
                    Email <span className="profile-create__required">*</span>
                  </label>
                  <input
                    type="email"
                    className="profile-create__input"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="nombre@goberna.com"
                    required
                  />
                </div>

                <div className="profile-create__field">
                  <label className="profile-create__label">Sitio web</label>
                  <input
                    type="url"
                    className="profile-create__input"
                    value={formData.website}
                    onChange={(e) => handleInputChange('website', e.target.value)}
                    placeholder="tuweb.com"
                  />
                </div>

                <div className="profile-create__field">
                  <label className="profile-create__label">Idiomas</label>
                  <input
                    type="text"
                    className="profile-create__input"
                    value={formData.languages}
                    onChange={(e) => handleInputChange('languages', e.target.value)}
                    placeholder="Español, Inglés, Portugués"
                  />
                </div>

                <h3 className="profile-create__subsection-title">Redes sociales</h3>
                
                <div className="profile-create__field">
                  <label className="profile-create__label profile-create__label--with-icon">
                    <FaFacebook size={16} /> Facebook
                  </label>
                  <input
                    type="url"
                    className="profile-create__input"
                    value={formData.socials.facebook}
                    onChange={(e) => handleSocialChange('facebook', e.target.value)}
                    placeholder="https://facebook.com/tuusuario"
                  />
                </div>

                <div className="profile-create__field">
                  <label className="profile-create__label profile-create__label--with-icon">
                    <FaInstagram size={16} /> Instagram
                  </label>
                  <input
                    type="url"
                    className="profile-create__input"
                    value={formData.socials.instagram}
                    onChange={(e) => handleSocialChange('instagram', e.target.value)}
                    placeholder="https://instagram.com/tuusuario"
                  />
                </div>

                <div className="profile-create__field">
                  <label className="profile-create__label profile-create__label--with-icon">
                    <FaXTwitter size={16} /> X (Twitter)
                  </label>
                  <input
                    type="url"
                    className="profile-create__input"
                    value={formData.socials.twitter}
                    onChange={(e) => handleSocialChange('twitter', e.target.value)}
                    placeholder="https://x.com/tuusuario"
                  />
                </div>

                <div className="profile-create__field">
                  <label className="profile-create__label profile-create__label--with-icon">
                    <FaLinkedin size={16} /> LinkedIn
                  </label>
                  <input
                    type="url"
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
                
                {formData.experiences.map((exp, index) => (
                  <div key={index} className="profile-create__item">
                    <div className="profile-create__item-header">
                      <span className="profile-create__item-number">Experiencia {index + 1}</span>
                      {formData.experiences.length > 1 && (
                        <button
                          type="button"
                          className="profile-create__item-remove"
                          onClick={() => removeExperience(index)}
                        >
                          <FaTrash size={14} />
                        </button>
                      )}
                    </div>

                    <div className="profile-create__field">
                      <label className="profile-create__label">Empresa / Organización</label>
                      <input
                        type="text"
                        className="profile-create__input"
                        value={exp.company}
                        onChange={(e) => handleExperienceChange(index, 'company', e.target.value)}
                        placeholder="Ej: Grupo Goberna"
                      />
                    </div>

                    <div className="profile-create__field">
                      <label className="profile-create__label">Cargo</label>
                      <input
                        type="text"
                        className="profile-create__input"
                        value={exp.role}
                        onChange={(e) => handleExperienceChange(index, 'role', e.target.value)}
                        placeholder="Ej: Director de Estrategia Electoral"
                      />
                    </div>

                    <div className="profile-create__row">
                      <div className="profile-create__field">
                        <label className="profile-create__label">Modalidad</label>
                        <select
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
                        <label className="profile-create__label">País</label>
                        <select
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
                      <label className="profile-create__label">Período</label>
                      <div className="profile-create__row">
                        <input
                          type="month"
                          className="profile-create__input"
                          value={exp.periodStart || ''}
                          onChange={(e) => handleExperienceChange(index, 'periodStart', e.target.value)}
                        />
                        <input
                          type="month"
                          className="profile-create__input"
                          value={exp.periodEnd || ''}
                          onChange={(e) => handleExperienceChange(index, 'periodEnd', e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="profile-create__field">
                      <label className="profile-create__label">Descripción</label>
                      <textarea
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
                
                {formData.educations.map((edu, index) => (
                  <div key={index} className="profile-create__item">
                    <div className="profile-create__item-header">
                      <span className="profile-create__item-number">Formación {index + 1}</span>
                      {formData.educations.length > 1 && (
                        <button
                          type="button"
                          className="profile-create__item-remove"
                          onClick={() => removeEducation(index)}
                        >
                          <FaTrash size={14} />
                        </button>
                      )}
                    </div>

                    <div className="profile-create__field">
                      <label className="profile-create__label">Institución</label>
                      <input
                        type="text"
                        className="profile-create__input"
                        value={edu.institution}
                        onChange={(e) => handleEducationChange(index, 'institution', e.target.value)}
                        placeholder="Ej: Escuela de Gobierno Goberna"
                      />
                    </div>

                    <div className="profile-create__field">
                      <label className="profile-create__label">Programa / Carrera</label>
                      <input
                        type="text"
                        className="profile-create__input"
                        value={edu.program}
                        onChange={(e) => handleEducationChange(index, 'program', e.target.value)}
                        placeholder="Ej: Especialización en Estrategia Política Electoral"
                      />
                    </div>

                    <div className="profile-create__field">
                      <label className="profile-create__label">Período</label>
                      <div className="profile-create__row">
                        <input
                          type="month"
                          className="profile-create__input"
                          value={edu.periodStart || ''}
                          onChange={(e) => handleEducationChange(index, 'periodStart', e.target.value)}
                        />
                        <input
                          type="month"
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
                  <label className="profile-create__label">Habilidades</label>
                  <input
                    type="text"
                    className="profile-create__input"
                    value={formData.skills}
                    onChange={(e) => handleInputChange('skills', e.target.value)}
                    placeholder="Ej: Empatía, Gestión del tiempo, Trabajo en equipo"
                  />
                  <span className="profile-create__hint">Separa las habilidades con comas</span>
                </div>
              </div>
            )}

            {/* Botón de envío */}
            <div className="profile-create__actions">
              {!isLastStep || !isCurrentStepValid ? (
                <button
                  type="button"
                  className="profile-create__submit profile-create__submit--next"
                  onClick={handleNextStep}
                >
                  <span>Seguir</span>
                </button>
              ) : (
                <button
                  type="submit"
                  className="profile-create__submit"
                  disabled={isSubmitting}
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
            </div>
          </form>
        </div>
      </div>

      <Footer enableReveal={false} />
    </div>
  );
}

export default ProfileCreatePage;
