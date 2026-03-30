import { useEffect, useRef, useState } from 'react';
import { Check, Minus, Pencil, Plus, RotateCcw, X } from 'lucide-react';
import { createPortal } from 'react-dom';

function createId(prefix) {
  return `${prefix}-${Date.now()}-${Math.round(Math.random() * 100000)}`;
}

function toArrayItems(values, fallback, prefix) {
  const source = Array.isArray(values) && values.length > 0 ? values : fallback;
  return source.map((value) => ({ id: createId(prefix), value }));
}

function toExperienceItems(values) {
  const source = Array.isArray(values) && values.length > 0 ? values : [];

  return source.map((item) => ({
    id: createId('experience'),
    company: item.company || '',
    role: item.role || '',
    mode: item.mode || '',
    period: item.period || '',
    country: item.country || '',
    summary: item.summary || '',
  }));
}

function normalizeEducation(item) {
  if (typeof item === 'string') {
    return {
      institution: 'Formacion Profesional',
      program: item,
      period: '',
    };
  }

  return {
    institution: item?.institution || '',
    program: item?.program || '',
    period: item?.period || '',
  };
}

function toEducationItems(values) {
  const source = Array.isArray(values) && values.length > 0 ? values : [];

  return source.map((item) => ({
    id: createId('education'),
    ...normalizeEducation(item),
  }));
}

function ProfileSectionEditorModal({ isOpen, sectionKey, itemIndex, profile, catalogs, onClose, onSave, onReset }) {
  const [draft, setDraft] = useState({});
  const [previewImage, setPreviewImage] = useState('');
  const [selectedSkillId, setSelectedSkillId] = useState('');
  const galleryFileInputRef = useRef(null);

  useEffect(() => {
    if (!isOpen || !sectionKey) {
      return;
    }

    if (sectionKey === 'identity') {
      setDraft({
        specialtyId: profile.specialtyId || '',
        countryId: profile.countryId || '',
      });
      return;
    }

    if (sectionKey === 'summary') {
      setDraft({
        summary: profile.summary || '',
      });
      return;
    }

    if (sectionKey === 'languages') {
      const values = (profile.languages || '')
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);
      setDraft({ languages: toArrayItems(values, [], 'language') });
      return;
    }

    if (sectionKey === 'skills') {
      const values = Array.isArray(profile.skillIds)
        ? profile.skillIds.map((skillId) => ({ id: createId('skill'), skillId }))
        : [];
      setDraft({ skills: values });
      setSelectedSkillId('');
      return;
    }

    if (sectionKey === 'contact') {
      setDraft({
        phone: profile.phone || '',
        email: profile.email || '',
        website: profile.website || '',
      });
      return;
    }

    if (sectionKey === 'experience') {
      const values = toExperienceItems(profile.experiences);

      if (Number.isInteger(itemIndex)) {
        const fallback = {
          id: createId('experience'),
          company: '',
          role: '',
          mode: 'Tiempo completo',
          period: '',
          country: '',
          summary: '',
        };

        setDraft({ experiences: [values[itemIndex] || fallback] });
        return;
      }

      setDraft({ experiences: values });
      return;
    }

    if (sectionKey === 'education') {
      const values = toEducationItems(profile.educations);

      if (Number.isInteger(itemIndex)) {
        setDraft({
          education:
            values[itemIndex] || {
              institution: '',
              program: '',
              period: '',
            },
        });
        return;
      }

      setDraft({ educations: values });
      return;
    }

    if (sectionKey === 'gallery') {
      setDraft({
        gallery: toArrayItems(profile.gallery || [], [], 'gallery'),
      });
      setPreviewImage('');
    }
  }, [isOpen, itemIndex, profile, sectionKey]);

  if (!isOpen || !sectionKey) {
    return null;
  }

  const updateArrayItem = (field, itemId, value) => {
    setDraft((current) => ({
      ...current,
      [field]: current[field].map((item) => (item.id === itemId ? { ...item, value } : item)),
    }));
  };

  const addSkill = () => {
    if (!selectedSkillId || draft.skills?.some((item) => item.skillId === selectedSkillId)) {
      return;
    }

    setDraft((current) => ({
      ...current,
      skills: [...(current.skills || []), { id: createId('skill'), skillId: selectedSkillId }],
    }));
    setSelectedSkillId('');
  };

  const removeSkill = (itemId) => {
    setDraft((current) => ({
      ...current,
      skills: (current.skills || []).filter((item) => item.id !== itemId),
    }));
  };

  const addArrayItem = (field) => {
    setDraft((current) => ({
      ...current,
      [field]: [...current[field], { id: createId(field), value: '' }],
    }));
  };

  const removeArrayItem = (field, itemId) => {
    setDraft((current) => {
      if (current[field].length <= 1) {
        return current;
      }

      return {
        ...current,
        [field]: current[field].filter((item) => item.id !== itemId),
      };
    });
  };

  const updateExperienceField = (itemId, field, value) => {
    setDraft((current) => ({
      ...current,
      experiences: current.experiences.map((experience) =>
        experience.id === itemId ? { ...experience, [field]: value } : experience
      ),
    }));
  };

  const addExperience = () => {
    setDraft((current) => ({
      ...current,
      experiences: [
        ...current.experiences,
        { id: createId('experience'), company: '', role: '', mode: 'Tiempo completo', period: '', country: '', summary: '' },
      ],
    }));
  };

  const updateEducationField = (itemId, field, value) => {
    setDraft((current) => ({
      ...current,
      educations: current.educations.map((education) =>
        education.id === itemId ? { ...education, [field]: value } : education
      ),
    }));
  };

  const addEducation = () => {
    setDraft((current) => ({
      ...current,
      educations: [...(current.educations || []), { id: createId('education'), institution: '', program: '', period: '' }],
    }));
  };

  const removeEducation = (itemId) => {
    setDraft((current) => ({
      ...current,
      educations: (current.educations || []).filter((education) => education.id !== itemId),
    }));
  };

  const removeExperience = (itemId) => {
    setDraft((current) => {
      if (current.experiences.length <= 1) {
        return current;
      }

      return {
        ...current,
        experiences: current.experiences.filter((experience) => experience.id !== itemId),
      };
    });
  };

  const submitSection = (event) => {
    event.preventDefault();

    if (sectionKey === 'identity' || sectionKey === 'summary' || sectionKey === 'languages' || sectionKey === 'skills') {
      if (sectionKey === 'identity') {
        onSave(sectionKey, draft);
        onClose();
        return;
      }

      if (sectionKey === 'languages') {
        onSave(sectionKey, {
          languages: draft.languages.map((item) => item.value).filter((item) => item.trim().length > 0).join(', '),
        });
      } else if (sectionKey === 'skills') {
        onSave(sectionKey, {
          skillIds: draft.skills.map((item) => item.skillId).filter(Boolean),
        });
      } else {
        onSave(sectionKey, draft);
      }
      onClose();
      return;
    }

    if (sectionKey === 'contact') {
      onSave(sectionKey, {
        phone: draft.phone,
        email: draft.email,
        website: draft.website,
      });
      onClose();
      return;
    }

    if (sectionKey === 'experience') {
      const nextExperiences = draft.experiences
        .map((experience) => ({
          company: experience.company.trim(),
          role: experience.role.trim(),
          mode: experience.mode.trim(),
          period: experience.period.trim(),
          country: experience.country.trim(),
          summary: experience.summary.trim(),
        }))
        .filter((experience) => experience.company || experience.role || experience.summary);

      if (Number.isInteger(itemIndex)) {
        onSave(sectionKey, {
          itemIndex,
          experience: nextExperiences[0] || { company: '', role: '', mode: 'Tiempo completo', period: '', country: '', summary: '' },
        });
        onClose();
        return;
      }

      onSave(sectionKey, {
        experiences: nextExperiences,
      });
      onClose();
      return;
    }

    if (sectionKey === 'education') {
      if (Number.isInteger(itemIndex)) {
        onSave(sectionKey, {
          itemIndex,
          education: {
            institution: (draft.education?.institution || '').trim(),
            program: (draft.education?.program || '').trim(),
            period: (draft.education?.period || '').trim(),
          },
        });
        onClose();
        return;
      }

      onSave(sectionKey, {
        educations: (draft.educations || [])
          .map((education) => ({
            institution: education.institution.trim(),
            program: education.program.trim(),
            period: education.period.trim(),
          }))
          .filter((education) => education.institution || education.program || education.period),
      });
      onClose();
      return;
    }

    if (sectionKey === 'gallery') {
      onSave(sectionKey, {
        gallery: draft.gallery.map((item) => item.value).filter((item) => item.trim().length > 0),
      });
      onClose();
    }
  };

  const addGalleryImagesFromFiles = async (event) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) {
      return;
    }

    const imageUrls = await Promise.all(
      files.map(
        (file) =>
          new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.readAsDataURL(file);
          })
      )
    );

    setDraft((current) => ({
      ...current,
      gallery: [
        ...(current.gallery || []),
        ...imageUrls.map((item) => ({ id: createId('gallery'), value: item })),
      ],
    }));

    event.target.value = '';
  };

  const titleBySection = {
    identity: 'Editar identidad profesional',
    summary: 'Editar resumen',
    languages: 'Editar idiomas',
    skills: 'Editar habilidades',
    contact: 'Editar contacto',
    experience: 'Editar experiencia profesional',
    education: 'Editar formacion profesional',
    gallery: 'Editar galeria',
  };

  return createPortal(
    <div className="profile-editor-overlay" role="dialog" aria-modal="true" aria-label="Editor de seccion">
      <button type="button" className="profile-editor-overlay__backdrop" aria-label="Cerrar editor" onClick={onClose} />

      <section className="profile-editor-panel">
        <header className="profile-editor-panel__header">
          <h3 className="profile-editor-panel__title">{titleBySection[sectionKey]}</h3>
          <button type="button" className="profile-editor-panel__close" aria-label="Cerrar editor" onClick={onClose}>
            <X size={18} aria-hidden="true" />
          </button>
        </header>

        <div className="profile-editor-panel__body">
          <form className="profile-editor-form" onSubmit={submitSection}>
            {sectionKey === 'summary' && (
              <textarea
                className="profile-editor-form__textarea"
                value={draft.summary || ''}
                onChange={(event) => setDraft((current) => ({ ...current, summary: event.target.value }))}
              />
            )}

            {sectionKey === 'identity' && (
              <>
                <select
                  className="profile-editor-form__input"
                  value={draft.specialtyId || ''}
                  onChange={(event) => setDraft((current) => ({ ...current, specialtyId: event.target.value }))}
                >
                  <option value="">Seleccionar especialidad...</option>
                  {(catalogs?.specialties || []).map((specialty) => (
                    <option key={specialty.id} value={specialty.id}>{specialty.label}</option>
                  ))}
                </select>
                <select
                  className="profile-editor-form__input"
                  value={draft.countryId || ''}
                  onChange={(event) => setDraft((current) => ({ ...current, countryId: event.target.value }))}
                >
                  <option value="">Seleccionar pais...</option>
                  {(catalogs?.countries || []).map((country) => (
                    <option key={country.id} value={country.id}>{country.label}</option>
                  ))}
                </select>
              </>
            )}

            {sectionKey === 'languages' && (
              <>
                <div className="profile-editor-form__list">
                  {draft.languages?.map((item) => (
                    <div key={item.id} className="profile-editor-row">
                      <input className="profile-editor-form__input" value={item.value} onChange={(event) => updateArrayItem('languages', item.id, event.target.value)} />
                      <button type="button" className="profile-editor-row__remove" onClick={() => removeArrayItem('languages', item.id)}>
                        <Minus size={14} aria-hidden="true" />
                      </button>
                    </div>
                  ))}
                </div>
                <button type="button" className="profile-editor-form__add" onClick={() => addArrayItem('languages')}>
                  <Plus size={14} aria-hidden="true" /> Agregar idioma
                </button>
              </>
            )}

            {sectionKey === 'skills' && (
              <>
                <div className="profile-editor-form__list">
                  {draft.skills?.map((item) => (
                    <div key={item.id} className="profile-editor-row">
                      <input
                        className="profile-editor-form__input"
                        value={(catalogs?.skills || []).find((skill) => skill.id === item.skillId)?.label || ''}
                        disabled
                        readOnly
                      />
                      <button type="button" className="profile-editor-row__remove" onClick={() => removeSkill(item.id)}>
                        <Minus size={14} aria-hidden="true" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="profile-editor-row">
                  <select className="profile-editor-form__input" value={selectedSkillId} onChange={(event) => setSelectedSkillId(event.target.value)}>
                    <option value="">Seleccionar habilidad...</option>
                    {(catalogs?.skills || [])
                      .filter((skill) => !(draft.skills || []).some((item) => item.skillId === skill.id))
                      .map((skill) => (
                        <option key={skill.id} value={skill.id}>{skill.label}</option>
                      ))}
                  </select>
                </div>
                <button type="button" className="profile-editor-form__add" onClick={addSkill}>
                  <Plus size={14} aria-hidden="true" /> Agregar habilidad
                </button>
              </>
            )}

            {sectionKey === 'contact' && (
              <>
                <input className="profile-editor-form__input" value={draft.phone || ''} onChange={(event) => setDraft((current) => ({ ...current, phone: event.target.value }))} placeholder="Telefono" />
                <input className="profile-editor-form__input" value={draft.email || ''} onChange={(event) => setDraft((current) => ({ ...current, email: event.target.value }))} placeholder="Email" />
                <input className="profile-editor-form__input" value={draft.website || ''} onChange={(event) => setDraft((current) => ({ ...current, website: event.target.value }))} placeholder="Web" />
              </>
            )}

            {sectionKey === 'experience' && (
              <div className="profile-editor-form__list">
                {draft.experiences?.map((experience) => (
                  <div key={experience.id} className="profile-editor-experience-item">
                    <div className="profile-editor-row">
                      <input className="profile-editor-form__input" value={experience.company} onChange={(event) => updateExperienceField(experience.id, 'company', event.target.value)} placeholder="Empresa" />
                      <input className="profile-editor-form__input" value={experience.role} onChange={(event) => updateExperienceField(experience.id, 'role', event.target.value)} placeholder="Cargo" />
                    </div>
                    <div className="profile-editor-row profile-editor-row--three">
                      <input className="profile-editor-form__input" value={experience.mode} onChange={(event) => updateExperienceField(experience.id, 'mode', event.target.value)} placeholder="Modalidad" />
                      <input className="profile-editor-form__input" value={experience.period} onChange={(event) => updateExperienceField(experience.id, 'period', event.target.value)} placeholder="Periodo" />
                      <select className="profile-editor-form__input" value={experience.country} onChange={(event) => updateExperienceField(experience.id, 'country', event.target.value)}>
                        <option value="">Pais</option>
                        {(catalogs?.countries || []).map((country) => (
                          <option key={country.id} value={country.label}>{country.label}</option>
                        ))}
                      </select>
                    </div>
                    <textarea className="profile-editor-form__textarea" value={experience.summary} onChange={(event) => updateExperienceField(experience.id, 'summary', event.target.value)} placeholder="Resumen de lo que se hizo" />
                    <button type="button" className="profile-editor-row__remove" onClick={() => removeExperience(experience.id)}>
                      <Minus size={14} aria-hidden="true" />
                    </button>
                  </div>
                ))}
                <button type="button" className="profile-editor-form__add" onClick={addExperience}>
                  <Plus size={14} aria-hidden="true" /> Agregar experiencia
                </button>
              </div>
            )}

            {sectionKey === 'education' && (
              <>
                {Number.isInteger(itemIndex) ? (
                  <div className="profile-editor-row profile-editor-row--three">
                    <input
                      className="profile-editor-form__input"
                      value={draft.education?.institution || ''}
                      onChange={(event) =>
                        setDraft((current) => ({
                          ...current,
                          education: {
                            ...current.education,
                            institution: event.target.value,
                          },
                        }))
                      }
                      placeholder="Institucion"
                    />
                    <input
                      className="profile-editor-form__input"
                      value={draft.education?.program || ''}
                      onChange={(event) =>
                        setDraft((current) => ({
                          ...current,
                          education: {
                            ...current.education,
                            program: event.target.value,
                          },
                        }))
                      }
                      placeholder="Programa o estudio"
                    />
                    <input
                      className="profile-editor-form__input"
                      value={draft.education?.period || ''}
                      onChange={(event) =>
                        setDraft((current) => ({
                          ...current,
                          education: {
                            ...current.education,
                            period: event.target.value,
                          },
                        }))
                      }
                      placeholder="Periodo"
                    />
                  </div>
                ) : (
                  <>
                    <div className="profile-editor-form__list">
                      {draft.educations?.map((education) => (
                        <div key={education.id} className="profile-editor-education-item">
                          <div className="profile-editor-row profile-editor-row--three">
                            <input
                              className="profile-editor-form__input"
                              value={education.institution}
                              onChange={(event) => updateEducationField(education.id, 'institution', event.target.value)}
                              placeholder="Institucion"
                            />
                            <input
                              className="profile-editor-form__input"
                              value={education.program}
                              onChange={(event) => updateEducationField(education.id, 'program', event.target.value)}
                              placeholder="Programa o estudio"
                            />
                            <input
                              className="profile-editor-form__input"
                              value={education.period}
                              onChange={(event) => updateEducationField(education.id, 'period', event.target.value)}
                              placeholder="Periodo"
                            />
                          </div>
                          <button type="button" className="profile-editor-row__remove" onClick={() => removeEducation(education.id)}>
                            <Minus size={14} aria-hidden="true" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <button type="button" className="profile-editor-form__add" onClick={addEducation}>
                      <Plus size={14} aria-hidden="true" /> Agregar formacion
                    </button>
                  </>
                )}
              </>
            )}

            {sectionKey === 'gallery' && (
              <>
                <div className="profile-editor-gallery-grid">
                  {draft.gallery?.map((item) => (
                    <div key={item.id} className="profile-editor-gallery-item">
                      <button type="button" className="profile-editor-gallery-item__thumb" onClick={() => setPreviewImage(item.value)}>
                        <img src={item.value} alt="Miniatura de galeria" loading="lazy" decoding="async" />
                      </button>
                      <button type="button" className="profile-editor-row__remove" onClick={() => removeArrayItem('gallery', item.id)}>
                        <Minus size={14} aria-hidden="true" />
                      </button>
                    </div>
                  ))}
                </div>

                {previewImage && (
                  <div className="profile-editor-gallery-preview">
                    <img src={previewImage} alt="Vista previa ampliada de galeria" />
                  </div>
                )}

                <button type="button" className="profile-editor-form__add" onClick={() => galleryFileInputRef.current?.click()}>
                  <Plus size={14} aria-hidden="true" /> Agregar imagen desde archivos
                </button>
                <input ref={galleryFileInputRef} type="file" accept="image/*" multiple className="profile-editor-form__file" onChange={addGalleryImagesFromFiles} />
              </>
            )}

            <div className="profile-editor-form__actions">
              <button type="submit" className="profile-editor-form__button profile-editor-form__button--save">
                <Check size={16} aria-hidden="true" /> Guardar
              </button>
              <button type="button" className="profile-editor-form__button" onClick={onReset}>
                <RotateCcw size={16} aria-hidden="true" /> Reset
              </button>
            </div>
          </form>
        </div>

        <p className="profile-editor-panel__hint">
          <Pencil size={14} aria-hidden="true" /> Edicion por seccion (sin foto ni certificados).
        </p>
      </section>
    </div>,
    document.body
  );
}

export default ProfileSectionEditorModal;
