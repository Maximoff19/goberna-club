interface ProfileSocial {
  network: string;
  url: string;
}

interface ProfileExperience {
  company: string;
  role: string;
  mode: string;
  period: string;
  country: string;
  summary: string;
}

interface ProfileEducation {
  institution: string;
  program: string;
  period: string;
}

interface ProfileDirectoryEntry {
  id: string;
  name: string;
  specialization: string;
  imageSrc: string;
  avatarSrc?: string;
  summary?: string;
  languages?: string;
  skills?: string;
  phone?: string;
  email?: string;
  website?: string;
  socials?: ProfileSocial[];
  experiences?: ProfileExperience[];
  educations?: ProfileEducation[];
  medals?: string[];
  gallery?: string[];
}

const PROFILE_DIRECTORY: ProfileDirectoryEntry[] = [
  {
    id: 'pf-1',
    name: 'Rodrigo Beltran',
    specialization: 'Analista de datos y especialista en ciberdefensa politica',
    imageSrc: '/perfiles/1.png',
    avatarSrc: '/fotoperfil.png',
    summary:
      'Consultor politico con experiencia en estrategia electoral, comunicacion de crisis y direccion de campanas en America Latina.',
    languages: 'Espanol, Ingles',
    skills: 'Empatia, Gestion del tiempo, Trabajo en equipo',
    phone: '(+51) 999 221 784',
    email: 'rodrigo.beltran@goberna.com',
    website: 'grupogoberna.com',
    socials: [
      { network: 'instagram', url: 'https://instagram.com' },
      { network: 'facebook', url: 'https://facebook.com' },
    ],
    experiences: [
      {
        company: 'Grupo Goberna',
        role: 'Director de Estrategia Electoral',
        mode: 'Tiempo completo',
        period: '2020 - Actualidad',
        country: 'Peru',
        summary:
          'Diseno de estrategia integral para candidatos presidenciales y subnacionales. Coordinacion de war room y analisis territorial.',
      },
      {
        company: 'Red Internacional de Consultores',
        role: 'Consultor Senior en Comunicacion Politica',
        mode: 'Consultoria',
        period: '2016 - 2020',
        country: 'Mexico',
        summary:
          'Acompanamiento en campanas legislativas y municipales con foco en reputacion digital y narrativa publica.',
      },
    ],
    educations: [
      {
        institution: 'Escuela de Gobierno Goberna',
        program: 'Especializacion en Estrategia Politica Electoral',
        period: '2018 - 2019',
      },
      {
        institution: 'Instituto Internacional de Comunicacion Politica',
        program: 'Diplomado en Comunicacion de Crisis y Narrativa Publica',
        period: '2016 - 2017',
      },
    ],
    medals: [
      'Top estratega electoral 2023',
      'Reconocimiento en comunicacion politica regional',
      'Premio a innovacion en analisis de opinion publica',
    ],
    gallery: [
      '/galeria/1c0ca2ea0f7ad3da8f9a68ae161cc016.jpg',
      '/galeria/333abe6e88c2beb8786d1cda08813aaf.jpg',
      '/galeria/c1784dd2a85d12fec367250aa4aeeb04.jpg',
      '/galeria/f115905a7713cb696e78db53b258c952.jpg',
    ],
  },
  {
    id: 'pf-2',
    name: 'Lucia Ibarra',
    specialization: 'Estratega en comunicacion politica digital',
    imageSrc: '/perfiles/2.png',
  },
  {
    id: 'pf-3',
    name: 'Matias Mendez',
    specialization: 'Consultor en opinion publica y territorio',
    imageSrc: '/perfiles/3.png',
  },
  {
    id: 'pf-4',
    name: 'Carolina Lopez',
    specialization: 'Especialista en branding y narrativa electoral',
    imageSrc: '/perfiles/4.png',
  },
  {
    id: 'pf-5',
    name: 'Federico Quiroga',
    specialization: 'Director de campanas y gestion de crisis',
    imageSrc: '/perfiles/5.jpg',
  },
  {
    id: 'pf-6',
    name: 'Julieta Sosa',
    specialization: 'Consultora en reputacion y liderazgo politico',
    imageSrc: '/perfiles/6.jpg',
  },
  {
    id: 'pf-7',
    name: 'Santiago Romero',
    specialization: 'Arquitecto de estrategia electoral avanzada',
    imageSrc: '/perfiles/7.jpg',
  },
];

export default PROFILE_DIRECTORY;
