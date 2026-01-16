// Plantillas de CV por categoría con ejemplos y consejos profesionales

export const RESUME_CATEGORIES = [
    'Gastronomía',
    'Limpieza',
    'Ventas',
    'Construcción',
    'Cuidado de personas',
    'Transporte',
    'Administración',
    'Tecnología',
    'Educación',
    'Salud',
    'Belleza',
    'Otros'
];

export const RESUME_TEMPLATES = {
    professional: {
        id: 'professional',
        name: 'Profesional',
        description: 'Diseño clásico y formal, ideal para oficinas y empresas',
        color: '#3B82F6'
    },
    modern: {
        id: 'modern',
        name: 'Moderno',
        description: 'Diseño contemporáneo con colores vibrantes',
        color: '#8B5CF6'
    },
    minimal: {
        id: 'minimal',
        name: 'Minimalista',
        description: 'Simple y directo, enfocado en el contenido',
        color: '#6B7280'
    }
};

// Campos según categoría
export const CATEGORY_FIELDS = {
    'Gastronomía': {
        specialFields: [
            { id: 'specialties', label: 'Especialidades culinarias', type: 'tags', placeholder: 'Ej: Cocina italiana, Pastelería, Parrilla' },
            { id: 'certifications', label: 'Certificaciones', type: 'tags', placeholder: 'Ej: Manipulación de alimentos, Chef profesional' }
        ],
        suggestedSkills: [
            'Cocina internacional', 'Repostería', 'Pastelería', 'Parrilla',
            'Organización de cocina', 'Control de inventario', 'Normas de higiene',
            'Trabajo bajo presión', 'Creatividad culinaria', 'Trabajo en equipo'
        ]
    },
    'Construcción': {
        specialFields: [
            { id: 'licenses', label: 'Licencias y carnets', type: 'tags', placeholder: 'Ej: Carnet de conducir, Habilitación altura' },
            { id: 'machinery', label: 'Maquinaria que maneja', type: 'tags', placeholder: 'Ej: Retroexcavadora, Mezcladora' }
        ],
        suggestedSkills: [
            'Albañilería', 'Lectura de planos', 'Electricidad', 'Plomería',
            'Carpintería', 'Pintura', 'Hormigonado', 'Trabajo en altura',
            'Seguridad industrial', 'Uso de herramientas eléctricas'
        ]
    },
    'Ventas': {
        specialFields: [
            { id: 'achievements', label: 'Logros en ventas', type: 'textarea', placeholder: 'Ej: Aumento del 30% en ventas, Mejor vendedor 2023' },
            { id: 'tools', label: 'Herramientas CRM', type: 'tags', placeholder: 'Ej: Salesforce, HubSpot, Excel' }
        ],
        suggestedSkills: [
            'Atención al cliente', 'Negociación', 'Cierre de ventas', 'Persuasión',
            'Manejo de objeciones', 'Fidelización', 'CRM', 'Trabajo por objetivos',
            'Comunicación efectiva', 'Proactividad'
        ]
    },
    'Cuidado de personas': {
        specialFields: [
            { id: 'certifications', label: 'Certificaciones', type: 'tags', placeholder: 'Ej: Primeros auxilios, Geriatría, RCP' },
            { id: 'experience_types', label: 'Experiencia específica', type: 'tags', placeholder: 'Ej: Alzheimer, Movilidad reducida, Niños' }
        ],
        suggestedSkills: [
            'Primeros auxilios', 'Paciencia', 'Empatía', 'Cuidado de adultos mayores',
            'Cuidado infantil', 'Administración de medicamentos', 'Movilización',
            'Preparación de alimentos', 'Higiene personal', 'Acompañamiento'
        ]
    },
    'Tecnología': {
        specialFields: [
            { id: 'tech_stack', label: 'Stack tecnológico', type: 'tags', placeholder: 'Ej: React, Node.js, Python, AWS' },
            { id: 'portfolio', label: 'Portfolio/GitHub', type: 'text', placeholder: 'https://github.com/usuario' }
        ],
        suggestedSkills: [
            'JavaScript', 'Python', 'React', 'Node.js', 'SQL', 'Git',
            'Metodologías ágiles', 'APIs REST', 'Testing', 'DevOps',
            'Resolución de problemas', 'Trabajo en equipo'
        ]
    },
    'Educación': {
        specialFields: [
            { id: 'subjects', label: 'Materias/Áreas', type: 'tags', placeholder: 'Ej: Matemáticas, Inglés, Primaria' },
            { id: 'publications', label: 'Publicaciones/Cursos dictados', type: 'textarea', placeholder: 'Describa publicaciones o cursos que haya dictado' }
        ],
        suggestedSkills: [
            'Planificación de clases', 'Evaluación', 'Comunicación',
            'Manejo de grupo', 'Creatividad didáctica', 'Paciencia',
            'Uso de tecnología educativa', 'Trabajo con familias',
            'Inclusión educativa', 'Desarrollo de programas'
        ]
    },
    'Limpieza': {
        specialFields: [
            { id: 'areas', label: 'Áreas de experiencia', type: 'tags', placeholder: 'Ej: Oficinas, Hogares, Industrias' },
            { id: 'equipment', label: 'Equipos que maneja', type: 'tags', placeholder: 'Ej: Hidrolavadoras, Pulidoras' }
        ],
        suggestedSkills: [
            'Limpieza profunda', 'Organización', 'Lavado y planchado',
            'Manejo de productos de limpieza', 'Puntualidad', 'Discreción',
            'Atención al detalle', 'Trabajo autónomo', 'Cocina básica'
        ]
    },
    'Administración': {
        specialFields: [
            { id: 'software', label: 'Software que maneja', type: 'tags', placeholder: 'Ej: Excel, SAP, Word, Sistemas contables' },
            { id: 'tasks', label: 'Tareas específicas', type: 'tags', placeholder: 'Ej: Facturación, Agenda, Archivos' }
        ],
        suggestedSkills: [
            'Microsoft Office', 'Organización de agenda', 'Atención telefónica',
            'Gestión de documentos', 'Redacción', 'Archivo', 'Facturación',
            'Atención al público', 'Multitarea', 'Confidencialidad'
        ]
    },
    'Transporte': {
        specialFields: [
            { id: 'licenses', label: 'Licencias de conducir', type: 'tags', placeholder: 'Ej: Profesional B, C, D' },
            { id: 'vehicles', label: 'Vehículos que maneja', type: 'tags', placeholder: 'Ej: Camión, Colectivo, Auto' }
        ],
        suggestedSkills: [
            'Conducción profesional', 'Conocimiento de rutas', 'Puntualidad',
            'Mantenimiento básico de vehículos', 'Logística', 'GPS',
            'Carga y descarga', 'Atención al cliente', 'Responsabilidad'
        ]
    },
    'Salud': {
        specialFields: [
            { id: 'certifications', label: 'Matrículas/Certificaciones', type: 'tags', placeholder: 'Ej: Enfermería, RCP, Primeros auxilios' },
            { id: 'specialization', label: 'Especialización', type: 'text', placeholder: 'Ej: Geriatría, Pediatría' }
        ],
        suggestedSkills: [
            'Atención al paciente', 'Primeros auxilios', 'RCP',
            'Administración de medicamentos', 'Registro de signos vitales',
            'Trabajo en equipo', 'Empatía', 'Normas de bioseguridad'
        ]
    },
    'Belleza': {
        specialFields: [
            { id: 'services', label: 'Servicios que ofrece', type: 'tags', placeholder: 'Ej: Corte, Color, Manicura, Maquillaje' },
            { id: 'brands', label: 'Marcas con las que trabaja', type: 'tags', placeholder: 'Ej: L\'Oréal, Wella' }
        ],
        suggestedSkills: [
            'Corte de cabello', 'Colorimetría', 'Manicura y pedicura',
            'Maquillaje', 'Depilación', 'Tratamientos capilares',
            'Atención al cliente', 'Tendencias de moda', 'Asesoramiento de imagen'
        ]
    },
    'Otros': {
        specialFields: [],
        suggestedSkills: [
            'Trabajo en equipo', 'Comunicación', 'Organización',
            'Puntualidad', 'Responsabilidad', 'Proactividad',
            'Adaptabilidad', 'Resolución de problemas', 'Aprendizaje rápido'
        ]
    }
};

// Ejemplos de CV por categoría
export const RESUME_EXAMPLES = {
    'Gastronomía': [
        {
            title: 'Cocinero con experiencia',
            summary: 'Cocinero profesional con más de 5 años de experiencia en restaurantes de alta categoría. Especializado en cocina internacional y parrilla argentina. Comprometido con la calidad y las normas de higiene.',
            experience: [
                {
                    position: 'Cocinero de línea',
                    company: 'Restaurante El Jardín',
                    period: '2020 - Presente',
                    description: 'Preparación de platos calientes, control de inventario, supervisión de ayudantes de cocina. Logré reducir el desperdicio de alimentos en un 20%.'
                }
            ]
        },
        {
            title: 'Mozo/Camarero',
            summary: 'Profesional de la gastronomía con experiencia en atención al cliente en restaurantes y eventos. Buena presencia, amabilidad y capacidad para trabajar bajo presión.',
            experience: [
                {
                    position: 'Mozo',
                    company: 'Bar Restaurant Centro',
                    period: '2019 - 2023',
                    description: 'Atención de hasta 15 mesas simultáneas, toma de pedidos, asesoramiento sobre carta de vinos. Destaque por las excelentes propinas y evaluaciones de clientes.'
                }
            ]
        },
        {
            title: 'Ayudante de cocina',
            summary: 'Joven entusiasta buscando crecer en el rubro gastronómico. Curso de manipulación de alimentos, puntualidad y muchas ganas de aprender.',
            experience: [
                {
                    position: 'Ayudante de cocina',
                    company: 'Pizzería Don Mario',
                    period: '2022 - 2023',
                    description: 'Preparación de ingredientes, limpieza de cocina, apoyo en la elaboración de pizzas y empanadas.'
                }
            ]
        }
    ],
    'Construcción': [
        {
            title: 'Albañil experimentado',
            summary: 'Albañil con más de 10 años de experiencia en construcción residencial y comercial. Experto en mampostería, revoques y terminaciones. Comprometido con la calidad y seguridad en obra.',
            experience: [
                {
                    position: 'Albañil oficial',
                    company: 'Constructora del Valle',
                    period: '2015 - Presente',
                    description: 'Construcción de viviendas, lectura de planos, supervisión de ayudantes. Participé en la construcción de más de 50 viviendas.'
                }
            ]
        },
        {
            title: 'Electricista matriculado',
            summary: 'Electricista con matrícula habilitante y 8 años de experiencia en instalaciones domiciliarias e industriales. Conocimiento actualizado de normativas de seguridad eléctrica.',
            experience: [
                {
                    position: 'Electricista independiente',
                    company: 'Servicios Eléctricos Roca',
                    period: '2017 - Presente',
                    description: 'Instalaciones nuevas, mantenimiento preventivo y correctivo. Especialización en domótica y tableros industriales.'
                }
            ]
        },
        {
            title: 'Plomero/Gasista',
            summary: 'Técnico en instalaciones sanitarias y de gas con matrícula provincial. Experiencia en obras nuevas y reparaciones. Trabajo limpio y garantizado.',
            experience: [
                {
                    position: 'Plomero oficial',
                    company: 'Empresa Constructora S.A.',
                    period: '2018 - 2023',
                    description: 'Instalación de cañerías, conexiones de gas, colocación de sanitarios y griferías. Trabajo en obras de hasta 20 unidades.'
                }
            ]
        }
    ],
    'Ventas': [
        {
            title: 'Vendedor comercial',
            summary: 'Ejecutivo de ventas con 5 años de experiencia superando objetivos. Orientado a resultados, excelente negociador y con sólida cartera de clientes. Manejo de CRM y herramientas digitales.',
            experience: [
                {
                    position: 'Vendedor senior',
                    company: 'Distribuidora Regional',
                    period: '2019 - Presente',
                    description: 'Gestión de cartera de 80+ clientes, incremento del 35% en ventas anuales. Desarrollo de nuevos clientes y fidelización.'
                }
            ]
        },
        {
            title: 'Atención al cliente',
            summary: 'Profesional de atención al cliente con experiencia en retail y call center. Excelente comunicación, resolución de conflictos y orientación al servicio.',
            experience: [
                {
                    position: 'Representante de atención',
                    company: 'Tienda Departamental XYZ',
                    period: '2020 - 2023',
                    description: 'Atención de consultas, gestión de reclamos, asesoramiento de productos. Logré una calificación de satisfacción del 95%.'
                }
            ]
        },
        {
            title: 'Promotor/Vendedor sin experiencia',
            summary: 'Joven proactivo buscando oportunidad en el área comercial. Excelente presencia, facilidad de palabra y muchas ganas de aprender y crecer profesionalmente.',
            experience: [
                {
                    position: 'Promotor eventual',
                    company: 'Eventos y Promociones',
                    period: '2023',
                    description: 'Promoción de productos en supermercados y eventos. Contacto directo con clientes y entrega de muestras.'
                }
            ]
        }
    ],
    'Cuidado de personas': [
        {
            title: 'Cuidador/a de adultos mayores',
            summary: 'Cuidador con 7 años de experiencia en atención de personas mayores. Certificado en geriatría y primeros auxilios. Paciente, empático y responsable.',
            experience: [
                {
                    position: 'Cuidador domiciliario',
                    company: 'Particular - Familia González',
                    period: '2018 - Presente',
                    description: 'Cuidado integral de adulto mayor con movilidad reducida. Administración de medicamentos, higiene personal, acompañamiento y actividades recreativas.'
                }
            ]
        },
        {
            title: 'Niñera profesional',
            summary: 'Niñera con amplia experiencia en el cuidado de niños de 0 a 12 años. Certificada en RCP infantil. Creativa, responsable y con excelentes referencias.',
            experience: [
                {
                    position: 'Niñera',
                    company: 'Particular - Varias familias',
                    period: '2016 - Presente',
                    description: 'Cuidado de niños, preparación de comidas, ayuda con tareas escolares, actividades educativas y recreativas. Referencias disponibles.'
                }
            ]
        },
        {
            title: 'Acompañante terapéutico',
            summary: 'Profesional formado en acompañamiento terapéutico con experiencia en pacientes con demencia y Alzheimer. Vocación de servicio y trabajo en equipo con profesionales de salud.',
            experience: [
                {
                    position: 'Acompañante terapéutico',
                    company: 'Clínica Salud Mental',
                    period: '2019 - 2023',
                    description: 'Acompañamiento de pacientes en internación y domicilio. Seguimiento de indicaciones médicas, contención emocional, registro de evolución.'
                }
            ]
        }
    ],
    'Tecnología': [
        {
            title: 'Desarrollador Full Stack',
            summary: 'Desarrollador web con 4 años de experiencia en React, Node.js y bases de datos SQL/NoSQL. Metodologías ágiles, trabajo remoto y en equipo. Portfolio disponible en GitHub.',
            experience: [
                {
                    position: 'Desarrollador Full Stack',
                    company: 'Software Solutions S.A.',
                    period: '2020 - Presente',
                    description: 'Desarrollo de aplicaciones web, APIs REST, integración de pasarelas de pago. Reducción del 40% en tiempos de carga.'
                }
            ]
        },
        {
            title: 'Técnico en soporte IT',
            summary: 'Técnico en sistemas con experiencia en soporte nivel 1 y 2, redes y administración de Windows/Linux. Certificaciones en CompTIA A+ y redes.',
            experience: [
                {
                    position: 'Técnico de soporte',
                    company: 'Empresa de Servicios IT',
                    period: '2019 - 2023',
                    description: 'Soporte técnico a usuarios, instalación de software, mantenimiento de equipos, configuración de redes. Atención de +50 tickets diarios.'
                }
            ]
        },
        {
            title: 'Programador junior',
            summary: 'Recién egresado de Tecnicatura en Programación, con conocimientos en JavaScript, Python y bases de datos. Proyectos personales en GitHub. Muchas ganas de aprender.',
            experience: [
                {
                    position: 'Pasante desarrollador',
                    company: 'Startup Tecnológica',
                    period: '2023',
                    description: 'Desarrollo de funcionalidades básicas, testing, documentación técnica. Proyecto final: aplicación de gestión de tareas.'
                }
            ]
        }
    ],
    'Educación': [
        {
            title: 'Docente de nivel primario',
            summary: 'Profesora de educación primaria con 10 años de experiencia. Especialización en educación inclusiva y uso de tecnología educativa. Excelentes evaluaciones de desempeño.',
            experience: [
                {
                    position: 'Maestra de grado',
                    company: 'Escuela Primaria N° 45',
                    period: '2014 - Presente',
                    description: 'Enseñanza de todas las áreas del nivel, planificación de clases, evaluación de alumnos, comunicación con familias. Coordinadora de proyectos de lectura.'
                }
            ]
        },
        {
            title: 'Profesor particular',
            summary: 'Estudiante universitario ofreciendo clases particulares de matemáticas y física para nivel secundario. Metodología adaptada a cada alumno, paciencia y resultados comprobables.',
            experience: [
                {
                    position: 'Profesor particular',
                    company: 'Independiente',
                    period: '2021 - Presente',
                    description: 'Clases individuales y grupales, preparación para exámenes, apoyo escolar. Más de 30 alumnos aprobaron materias pendientes.'
                }
            ]
        },
        {
            title: 'Tutor/Mentor educativo',
            summary: 'Licenciado en Psicopedagogía con experiencia en apoyo escolar y orientación vocacional. Trabajo con niños y adolescentes con dificultades de aprendizaje.',
            experience: [
                {
                    position: 'Psicopedagogo',
                    company: 'Centro de Apoyo Escolar',
                    period: '2018 - 2023',
                    description: 'Evaluación psicopedagógica, diseño de estrategias de aprendizaje, trabajo con familias y docentes. Éxito del 85% en reintegración escolar.'
                }
            ]
        }
    ],
    'Otros': [
        {
            title: 'Profesional multifacético',
            summary: 'Persona responsable, puntual y con experiencia en diversos rubros. Rápido aprendizaje, adaptabilidad y compromiso con el trabajo. Disponibilidad horaria completa.',
            experience: [
                {
                    position: 'Empleado polivalente',
                    company: 'Diferentes empresas',
                    period: '2019 - Presente',
                    description: 'Experiencia en atención al público, tareas administrativas básicas, logística y depósito. Capacidad de adaptación a diferentes entornos.'
                }
            ]
        },
        {
            title: 'Primer empleo',
            summary: 'Joven recién egresado del secundario buscando su primera oportunidad laboral. Responsable, educado y con muchas ganas de aprender cualquier oficio.',
            experience: [
                {
                    position: 'Voluntario',
                    company: 'ONG Comunitaria',
                    period: '2022 - 2023',
                    description: 'Ayuda en organización de eventos, distribución de alimentos, tareas generales. Experiencia en trabajo en equipo y atención al público.'
                }
            ]
        },
        {
            title: 'Trabajador general',
            summary: 'Persona con disponibilidad inmediata para trabajos variados. Experiencia en changas, mudanzas, jardinería y mantenimiento general. Responsable y trabajador.',
            experience: [
                {
                    position: 'Trabajador independiente',
                    company: 'Servicios varios',
                    period: '2020 - Presente',
                    description: 'Mudanzas, fletes, jardinería básica, pintura, limpieza de terrenos. Vehículo propio para traslados.'
                }
            ]
        }
    ]
};

// Consejos profesionales por categoría
export const RESUME_TIPS = {
    'Gastronomía': [
        'Menciona las especialidades culinarias que dominas',
        'Incluye certificaciones de manipulación de alimentos',
        'Destaca tu capacidad de trabajar bajo presión',
        'Si tienes experiencia en eventos o catering, mencionalo'
    ],
    'Construcción': [
        'Incluye todas las licencias y habilitaciones que tengas',
        'Menciona la maquinaria y herramientas que sabés manejar',
        'Destaca tu experiencia en seguridad e higiene laboral',
        'Si tenés matrícula de electricista o gasista, resaltalo'
    ],
    'Ventas': [
        'Incluye logros cuantificables (porcentaje de ventas, metas superadas)',
        'Menciona las herramientas CRM que manejás',
        'Destaca tus habilidades de negociación y cierre',
        'Si tenés cartera de clientes propia, es un plus'
    ],
    'Cuidado de personas': [
        'Incluye certificaciones de primeros auxilios y RCP',
        'Menciona tu experiencia con condiciones específicas (Alzheimer, etc.)',
        'Las referencias son muy importantes en este rubro',
        'Destaca tu empatía, paciencia y responsabilidad'
    ],
    'Tecnología': [
        'Lista tu stack tecnológico completo y niveles de dominio',
        'Incluye links a tu portfolio, GitHub o LinkedIn',
        'Menciona proyectos personales que demuestren tus habilidades',
        'Destaca tu experiencia con metodologías ágiles'
    ],
    'Educación': [
        'Incluye tu título habilitante y matrículas',
        'Menciona las materias o niveles en los que tenés experiencia',
        'Destaca cursos de capacitación docente',
        'Si tenés experiencia con educación inclusiva, resaltalo'
    ],
    'Limpieza': [
        'Menciona los tipos de espacios donde trabajaste (casas, oficinas, industrias)',
        'Destaca tu puntualidad, responsabilidad y discreción',
        'Las referencias de empleadores anteriores son muy valiosas',
        'Si tenés experiencia con equipos especiales, incluilo'
    ],
    'Administración': [
        'Lista los programas de software que manejás (Excel avanzado, SAP, etc.)',
        'Destaca tu capacidad de organización y multitarea',
        'Menciona si tenés experiencia en facturación o contabilidad básica',
        'Incluye idiomas que manejes, especialmente inglés'
    ],
    'Otros': [
        'Resalta tus habilidades transferibles a cualquier trabajo',
        'Destaca tu disposición para aprender cosas nuevas',
        'Menciona cualquier experiencia, incluso voluntariados',
        'Enfatiza tu puntualidad, responsabilidad y compromiso'
    ]
};

// Estructura base del CV
export const EMPTY_RESUME = {
    personalInfo: {
        fullName: '',
        title: '',
        phone: '',
        email: '',
        location: '',
        photo: ''
    },
    summary: '',
    experience: [],
    education: [],
    skills: [],
    languages: [],
    customFields: {}
};
