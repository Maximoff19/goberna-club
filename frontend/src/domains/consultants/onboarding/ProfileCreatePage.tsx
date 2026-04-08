import type { ChangeEvent, FormEvent, ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { FaPlus, FaTrash, FaUpload, FaBriefcase, FaGraduationCap, FaMedal, FaCheck, FaUser, FaEnvelope, FaCircleExclamation } from 'react-icons/fa6';
import type { IconType } from 'react-icons/lib';
import Footer from '../../marketing/home/footer/Footer';
import { createProfile, fetchProfileCatalogs, uploadProfileAvatar } from '../../../shared/api/gobernaApi';
import './profileCreate.css';

const MODES = [
  'Tiempo completo',
  'Medio tiempo',
  'Freelance',
  'Consultoria',
  'Contrato',
];

const STEPS = ['basicos', 'contacto', 'experiencia', 'educacion', 'adicional'] as const;
type StepId = (typeof STEPS)[number];

interface CatalogItem {
  id: string;
  label: string;
  code?: string;
}

interface Catalogs {
  countries: CatalogItem[];
  specialties: CatalogItem[];
  skills: CatalogItem[];
}

interface FieldTooltipProps {
  content: string;
}

// Tooltip component
function FieldTooltip({ content }: FieldTooltipProps) {
  return (
    <span className="profile-create__tooltip-wrapper">
      <button type="button" className="profile-create__tooltip-trigger" aria-label="Informacion">
        i
      </button>
      <span className="profile-create__tooltip">{content}</span>
    </span>
  );
}

interface LabelWithTooltipProps {
  children: ReactNode;
  tooltip?: string;
  required?: boolean;
  htmlFor?: string;
}

// Field component with optional tooltip
function LabelWithTooltip({ children, tooltip, required, htmlFor }: LabelWithTooltipProps) {
  return (
    <div className="profile-create__label-row">
      <label className="profile-create__label" htmlFor={htmlFor}>
        {children} {required && <span className="profile-create__required">*</span>}
      </label>
      {tooltip && <FieldTooltip content={tooltip} />}
    </div>
  );
}

interface SectionNav {
  id: StepId;
  label: string;
  icon: IconType;
}

interface ProfileCreatePageProps {
  onProfileCreated?: (profileData: any) => void;
}

function ProfileCreatePage({ onProfileCreated }: ProfileCreatePageProps) {
  const [catalogs, setCatalogs] = useState<Catalogs>({ countries: [], specialties: [], skills: [] });
  const [selectedSkillId, setSelectedSkillId] = useState('');
  const createExperienceItem = () => ({
    id: crypto.randomUUID(),
    company: '',
    role: '',
    mode: '',
    periodStart: '',
    periodEnd: '',
    country: '',
    summary: '',
  });

  const createEducationItem = () => ({
    id: crypto.randomUUID(),
    institution: '',
    program: '',
    periodStart: '',
    periodEnd: '',
  });

  // Form data is highly dynamic with runtime-added keys like `avatarSrcFile`.
  // Using `any` intentionally for this polymorphic form state.
  const [formData, setFormData] = useState<any>({
    name: '',
    specialization: '',
    specializationLabel: '',
    country: '',
    countryLabel: '',
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
    experiences: [createExperienceItem()],
    educations: [createEducationItem()],
    languages: '',
    skills: [] as string[],
    gallery: [] as string[],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeSection, setActiveSection] = useState<StepId>('basicos');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showErrorToast, setShowErrorToast] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let ignore = false;

    fetchProfileCatalogs()
      .then((payload: any) => {
        if (!ignore) {
          setCatalogs(payload);
        }
      })
      .catch(() => {
        if (!ignore) {
          setCatalogs({ countries: [], specialties: [], skills: [] });
        }
      });

    return () => {
      ignore = true;
    };
  }, []);

  // Validacion por paso
  const validateStep = (step: StepId): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (step === 'basicos') {
      if (!formData.name?.trim()) {
        newErrors.name = 'El nombre es obligatorio';
      }
      if (!formData.specialization) {
        newErrors.specialization = 'La especializacion es obligatoria';
      }
    }
    
    if (step === 'contacto') {
      const hasContact = formData.email?.trim() || formData.phone?.trim() || formData.website?.trim();
      if (!hasContact) {
        newErrors.contact = 'Agrega al menos un medio de contacto (email, telefono o sitio web)';
      }
      if (formData.email?.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'Ingresa un email valido';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isCurrentStepValid = (): boolean => {
    if (activeSection === 'basicos') {
      return Boolean(formData.name?.trim() && formData.specialization);
    }
    if (activeSection === 'contacto') {
      return Boolean(formData.email?.trim() || formData.phone?.trim() || formData.website?.trim());
    }
    return true;
  };

  const isLastStep = activeSection === 'adicional';
  const canProceed = isCurrentStepValid();

  const handleNextStep = (event: FormEvent) => {
    event.preventDefault();

    if (!validateStep(activeSection)) {
      setErrorMessage('Completa los campos obligatorios para continuar');
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

  const clearError = (field: string) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  };

  const handleInputChange = (field: string, value: string) => {
    clearError(field);
    setFormData((prev: any) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSelectChange = (field: string, value: string, options: CatalogItem[]) => {
    const selectedOption = options.find((option) => option.id === value) || options.find((option) => option.code === value);
    clearError(field);
    setFormData((prev: any) => ({
      ...prev,
      [field]: value,
      ...(field === 'specialization' ? { specializationLabel: selectedOption?.label || '' } : {}),
      ...(field === 'country' ? { countryLabel: selectedOption?.label || '' } : {}),
    }));
  };

  const addSkill = () => {
    if (!selectedSkillId || formData.skills.includes(selectedSkillId)) {
      return;
    }

    setFormData((prev: any) => ({
      ...prev,
      skills: [...prev.skills, selectedSkillId],
    }));
    setSelectedSkillId('');
  };

  const removeSkill = (skillId: string) => {
    setFormData((prev: any) => ({
      ...prev,
      skills: prev.skills.filter((item: string) => item !== skillId),
    }));
  };

  const handleFileChange = async (field: string, e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }

    try {
      // Store the raw File for server upload, plus a local preview
      const previewUrl = URL.createObjectURL(file);
      setFormData((prev: any) => ({
        ...prev,
        [field]: previewUrl,
        [`${field}File`]: file,
      }));
    } catch (error) {
      const nextMessage = error instanceof Error ? error.message : 'No pudimos procesar la imagen.';
      setErrorMessage(nextMessage);
      setShowErrorToast(true);
      setTimeout(() => setShowErrorToast(false), 4000);
    } finally {
      e.target.value = '';
    }
  };

  const handleSocialChange = (network: string, value: string) => {
    clearError('contact');
    setFormData((prev: any) => ({
      ...prev,
      socials: {
        ...prev.socials,
        [network]: value,
      },
    }));
  };

  const handleExperienceChange = (index: number, field: string, value: string) => {
    setFormData((prev: any) => ({
      ...prev,
        experiences: prev.experiences.map((exp: any, i: number) =>
          i === index ? { ...exp, [field]: value } : exp
        ),
    }));
  };

  const handleEducationChange = (index: number, field: string, value: string) => {
    setFormData((prev: any) => ({
      ...prev,
        educations: prev.educations.map((edu: any, i: number) =>
          i === index ? { ...edu, [field]: value } : edu
        ),
    }));
  };

  const addExperience = () => {
    setFormData((prev: any) => ({
      ...prev,
      experiences: [
        ...prev.experiences,
        createExperienceItem(),
      ],
    }));
  };

  const removeExperience = (index: number) => {
    if (formData.experiences.length > 1) {
      setFormData((prev: any) => ({
        ...prev,
        experiences: prev.experiences.filter((_: any, i: number) => i !== index),
      }));
    }
  };

  const addEducation = () => {
    setFormData((prev: any) => ({
      ...prev,
      educations: [
        ...prev.educations,
        createEducationItem(),
      ],
    }));
  };

  const removeEducation = (index: number) => {
    if (formData.educations.length > 1) {
      setFormData((prev: any) => ({
        ...prev,
        educations: prev.educations.filter((_: any, i: number) => i !== index),
      }));
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateStep(activeSection)) {
      setErrorMessage('Completa los campos obligatorios para crear tu perfil');
      setShowErrorToast(true);
      setTimeout(() => setShowErrorToast(false), 4000);
      return;
    }

    setIsSubmitting(true);

    try {
      const profileData = await createProfile(formData);

      // Upload avatar file to server if one was selected
      if (formData.avatarSrcFile && (profileData as any)?.id) {
        try {
          await uploadProfileAvatar((profileData as any).id, formData.avatarSrcFile);
        } catch {
          // Avatar upload failed but profile was created, continue
        }
      }

      if (onProfileCreated) {
        onProfileCreated(profileData);
      }
      window.location.hash = `#mi-perfil/${(profileData as any).id}`;
    } catch (error) {
      const nextMessage = error instanceof Error ? error.message : 'No pudimos crear el perfil.';
      if (nextMessage === 'AUTH_REQUIRED') {
        window.location.hash = '#acceso-consultor';
        return;
      }
      setErrorMessage(nextMessage);
      setShowErrorToast(true);
      setTimeout(() => setShowErrorToast(false), 4000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentStepIndex = STEPS.indexOf(activeSection);

  const sections: SectionNav[] = [
    { id: 'basicos', label: 'Basicos', icon: FaUser },
    { id: 'contacto', label: 'Contacto', icon: FaEnvelope },
    { id: 'experiencia', label: 'Experiencia', icon: FaBriefcase },
    { id: 'educacion', label: 'Educacion', icon: FaGraduationCap },
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
            Completa tu informacion para unirte a la red de consultores politicos
          </p>
        </header>

        <div className="profile-create__layout">
          {/* Sidebar de navegacion */}
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
            {/* Seccion: Datos Basicos */}
            {activeSection === 'basicos' && (
              <div className="profile-create__section">
                <h2 className="profile-create__section-title">Informacion basica</h2>
                
                <div className={`profile-create__field ${errors.name ? 'profile-create__field--error' : ''}`}>
                  <LabelWithTooltip 
                    tooltip="Tu nombre completo tal como aparecera en tu perfil publico" 
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
                    placeholder="Ej: Rodrigo Beltran"
                  />
                  {errors.name && (
                    <span className="profile-create__field-error">
                      <FaCircleExclamation size={12} /> {errors.name}
                    </span>
                  )}
                </div>

                <div className={`profile-create__field ${errors.specialization ? 'profile-create__field--error' : ''}`}>
                  <LabelWithTooltip 
                    tooltip="Tu area de especializacion principal en consultoria politica" 
                    required
                  >
                    Especializacion
                  </LabelWithTooltip>
                  <select
                    id="specialization"
                    className="profile-create__select"
                    value={formData.specialization}
                    onChange={(e) => handleSelectChange('specialization', e.target.value, catalogs.specialties)}
                  >
                    <option value="">Seleccionar...</option>
                    {catalogs.specialties.map((specialty) => (
                      <option key={specialty.id} value={specialty.id}>{specialty.label}</option>
                    ))}
                  </select>
                  {errors.specialization && (
                    <span className="profile-create__field-error">
                      <FaCircleExclamation size={12} /> {errors.specialization}
                    </span>
                  )}
                </div>

                <div className="profile-create__field">
                  <LabelWithTooltip tooltip="Pais donde resides o trabajas principalmente">
                    Pais
                  </LabelWithTooltip>
                  <select
                    id="country"
                    className="profile-create__select"
                    value={formData.country || ''}
                    onChange={(e) => handleSelectChange('country', e.target.value, catalogs.countries)}
                  >
                    <option value="">Seleccionar...</option>
                    {catalogs.countries.map((country) => (
                      <option key={country.id} value={country.id}>{country.label}</option>
                    ))}
                  </select>
                </div>

                <div className="profile-create__field">
                  <LabelWithTooltip tooltip="Una breve descripcion de tu experiencia y enfoque profesional">
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

            {/* Seccion: Contacto */}
            {activeSection === 'contacto' && (
              <div className="profile-create__section">
                <h2 className="profile-create__section-title">Informacion de contacto</h2>
                
                {errors.contact && (
                  <div className="profile-create__field-error" style={{ marginBottom: 16, fontSize: 13 }}>
                    <FaCircleExclamation size={14} /> {errors.contact}
                  </div>
                )}
                
                <div className={`profile-create__field ${errors.phone ? 'profile-create__field--error' : ''}`}>
                  <LabelWithTooltip tooltip="Tu numero de telefono para contacto directo">
                    Telefono
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
                  <LabelWithTooltip tooltip="Tu correo electronico principal de contacto">
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
                    placeholder="Espanol, Ingles, Portugues"
                  />
                </div>

                <h3 className="profile-create__subsection-title">Redes sociales</h3>

                <div className="profile-create__field">
                  <label className="profile-create__label" htmlFor="facebook">Facebook</label>
                  <input type="url" id="facebook" className="profile-create__input" value={formData.socials.facebook} onChange={(e) => handleSocialChange('facebook', e.target.value)} placeholder="https://facebook.com/tuusuario" />
                </div>
                <div className="profile-create__field">
                  <label className="profile-create__label" htmlFor="instagram">Instagram</label>
                  <input type="url" id="instagram" className="profile-create__input" value={formData.socials.instagram} onChange={(e) => handleSocialChange('instagram', e.target.value)} placeholder="https://instagram.com/tuusuario" />
                </div>
                <div className="profile-create__field">
                  <label className="profile-create__label" htmlFor="twitter">X (Twitter)</label>
                  <input type="url" id="twitter" className="profile-create__input" value={formData.socials.twitter} onChange={(e) => handleSocialChange('twitter', e.target.value)} placeholder="https://x.com/tuusuario" />
                </div>
                <div className="profile-create__field">
                  <label className="profile-create__label" htmlFor="linkedin">LinkedIn</label>
                  <input type="url" id="linkedin" className="profile-create__input" value={formData.socials.linkedin} onChange={(e) => handleSocialChange('linkedin', e.target.value)} placeholder="https://linkedin.com/in/tuusuario" />
                </div>
              </div>
            )}

            {/* Seccion: Experiencia */}
            {activeSection === 'experiencia' && (
              <div className="profile-create__section">
                <h2 className="profile-create__section-title">Experiencia laboral</h2>
                
                <div className="profile-create__field">
                  <LabelWithTooltip tooltip="Podes agregar una o mas experiencias laborales. Si no tenes experiencia, podes saltar este paso">
                    Agrega tu experiencia profesional
                  </LabelWithTooltip>
                </div>
                
                {formData.experiences.map((exp: any, index: number) => (
                  <div key={exp.id} className="profile-create__item">
                    <div className="profile-create__item-header">
                      <span className="profile-create__item-number">Experiencia {index + 1}</span>
                      {formData.experiences.length > 1 && (
                        <button type="button" className="profile-create__item-remove" onClick={() => removeExperience(index)} aria-label="Eliminar experiencia">
                          <FaTrash size={14} />
                        </button>
                      )}
                    </div>

                    <div className="profile-create__field">
                      <label className="profile-create__label" htmlFor={`exp-company-${index}`}>Empresa / Organizacion</label>
                      <input type="text" id={`exp-company-${index}`} className="profile-create__input" value={exp.company} onChange={(e) => handleExperienceChange(index, 'company', e.target.value)} placeholder="Ej: Grupo Goberna" />
                    </div>
                    <div className="profile-create__field">
                      <label className="profile-create__label" htmlFor={`exp-role-${index}`}>Cargo</label>
                      <input type="text" id={`exp-role-${index}`} className="profile-create__input" value={exp.role} onChange={(e) => handleExperienceChange(index, 'role', e.target.value)} placeholder="Ej: Director de Estrategia Electoral" />
                    </div>

                    <div className="profile-create__row">
                      <div className="profile-create__field">
                        <label className="profile-create__label" htmlFor={`exp-mode-${index}`}>Modalidad</label>
                        <select id={`exp-mode-${index}`} className="profile-create__select" value={exp.mode} onChange={(e) => handleExperienceChange(index, 'mode', e.target.value)}>
                          <option value="">Seleccionar...</option>
                          {MODES.map(mode => (
                            <option key={mode} value={mode}>{mode}</option>
                          ))}
                        </select>
                      </div>
                      <div className="profile-create__field">
                        <label className="profile-create__label" htmlFor={`exp-country-${index}`}>Pais</label>
                        <select id={`exp-country-${index}`} className="profile-create__select" value={exp.country} onChange={(e) => handleExperienceChange(index, 'country', e.target.value)}>
                          <option value="">Seleccionar...</option>
                          {catalogs.countries.map((country) => (
                            <option key={country.id} value={country.label}>{country.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="profile-create__field">
                      <LabelWithTooltip tooltip="Mes y ano de inicio y fin. Si aun estas ahi, deja vacio el campo 'Fin'">
                        Periodo
                      </LabelWithTooltip>
                      <div className="profile-create__row">
                        <input type="month" id={`exp-start-${index}`} className="profile-create__input" value={exp.periodStart || ''} onChange={(e) => handleExperienceChange(index, 'periodStart', e.target.value)} />
                        <input type="month" id={`exp-end-${index}`} className="profile-create__input" value={exp.periodEnd || ''} onChange={(e) => handleExperienceChange(index, 'periodEnd', e.target.value)} placeholder="En curso" />
                      </div>
                    </div>

                    <div className="profile-create__field">
                      <label className="profile-create__label" htmlFor={`exp-summary-${index}`}>Descripcion</label>
                      <textarea id={`exp-summary-${index}`} className="profile-create__textarea" value={exp.summary} onChange={(e) => handleExperienceChange(index, 'summary', e.target.value)} placeholder="Describe tus responsabilidades y logros..." rows={3} />
                    </div>
                  </div>
                ))}

                <button type="button" className="profile-create__add-button" onClick={addExperience}>
                  <FaPlus size={14} />
                  Agregar experiencia
                </button>
              </div>
            )}

            {/* Seccion: Educacion */}
            {activeSection === 'educacion' && (
              <div className="profile-create__section">
                <h2 className="profile-create__section-title">Formacion academica</h2>
                
                <div className="profile-create__field">
                  <LabelWithTooltip tooltip="Agrega tu formacion academica. Podes agregar varias o saltar este paso si no aplica">
                    Agrega tu formacion educativa
                  </LabelWithTooltip>
                </div>
                
                {formData.educations.map((edu: any, index: number) => (
                  <div key={edu.id} className="profile-create__item">
                    <div className="profile-create__item-header">
                      <span className="profile-create__item-number">Formacion {index + 1}</span>
                      {formData.educations.length > 1 && (
                        <button type="button" className="profile-create__item-remove" onClick={() => removeEducation(index)} aria-label="Eliminar formacion">
                          <FaTrash size={14} />
                        </button>
                      )}
                    </div>

                    <div className="profile-create__field">
                      <label className="profile-create__label" htmlFor={`edu-institution-${index}`}>Institucion</label>
                      <input type="text" id={`edu-institution-${index}`} className="profile-create__input" value={edu.institution} onChange={(e) => handleEducationChange(index, 'institution', e.target.value)} placeholder="Ej: Escuela de Gobierno Goberna" />
                    </div>
                    <div className="profile-create__field">
                      <label className="profile-create__label" htmlFor={`edu-program-${index}`}>Programa / Carrera</label>
                      <input type="text" id={`edu-program-${index}`} className="profile-create__input" value={edu.program} onChange={(e) => handleEducationChange(index, 'program', e.target.value)} placeholder="Ej: Especializacion en Estrategia Politica Electoral" />
                    </div>

                    <div className="profile-create__field">
                      <LabelWithTooltip tooltip="Mes y ano de inicio y fin de tus estudios">
                        Periodo
                      </LabelWithTooltip>
                      <div className="profile-create__row">
                        <input type="month" id={`edu-start-${index}`} className="profile-create__input" value={edu.periodStart || ''} onChange={(e) => handleEducationChange(index, 'periodStart', e.target.value)} />
                        <input type="month" id={`edu-end-${index}`} className="profile-create__input" value={edu.periodEnd || ''} onChange={(e) => handleEducationChange(index, 'periodEnd', e.target.value)} />
                      </div>
                    </div>
                  </div>
                ))}

                <button type="button" className="profile-create__add-button" onClick={addEducation}>
                  <FaPlus size={14} />
                  Agregar formacion
                </button>
              </div>
            )}

            {/* Seccion: Adicional */}
            {activeSection === 'adicional' && (
              <div className="profile-create__section">
                <h2 className="profile-create__section-title">Informacion adicional</h2>
                
                <div className="profile-create__field">
                  <LabelWithTooltip tooltip="Selecciona habilidades desde el catalogo para mantener el perfil normalizado y facil de encontrar.">
                    Habilidades
                  </LabelWithTooltip>
                  <div className="profile-create__row">
                    <select
                      id="skills"
                      className="profile-create__select"
                      value={selectedSkillId}
                      onChange={(e) => setSelectedSkillId(e.target.value)}
                    >
                      <option value="">Seleccionar habilidad...</option>
                      {catalogs.skills
                        .filter((skill) => !formData.skills.includes(skill.id))
                        .map((skill) => (
                          <option key={skill.id} value={skill.id}>{skill.label}</option>
                        ))}
                    </select>
                    <button type="button" className="profile-create__add-button" onClick={addSkill}>
                      <FaPlus size={14} />
                      Agregar
                    </button>
                  </div>
                  <div className="profile-pill-list" style={{ marginTop: 12 }}>
                    {formData.skills.map((skillId: string) => {
                      const skill = catalogs.skills.find((item) => item.id === skillId);
                      return (
                        <button
                          key={skillId}
                          type="button"
                          className="profile-pill"
                          onClick={() => removeSkill(skillId)}
                          style={{ border: 'none', cursor: 'pointer' }}
                        >
                          {skill?.label || 'Habilidad'} <FaTrash size={10} style={{ marginLeft: 6 }} />
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Boton de navegacion y envio */}
            <div className="profile-create__actions">
              {currentStepIndex > 0 && (
                <button
                  type="button"
                  onClick={handlePrevStep}
                  style={{ marginBottom: 12, background: 'transparent', border: 'none', color: '#0F1923', cursor: 'pointer', fontSize: 13, opacity: 0.7 }}
                >
                  Volver atras
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
                  Completa los campos obligatorios para continuar
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
