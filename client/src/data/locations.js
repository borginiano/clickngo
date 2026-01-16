// Data for Argentina, Uruguay and Chile location selectors

export const countries = [
    { code: 'AR', name: 'Argentina' },
    { code: 'UY', name: 'Uruguay' },
    { code: 'CL', name: 'Chile' }
];

export const provinces = {
    AR: [
        'Buenos Aires',
        'CABA',
        'Catamarca',
        'Chaco',
        'Chubut',
        'Córdoba',
        'Corrientes',
        'Entre Ríos',
        'Formosa',
        'Jujuy',
        'La Pampa',
        'La Rioja',
        'Mendoza',
        'Misiones',
        'Neuquén',
        'Río Negro',
        'Salta',
        'San Juan',
        'San Luis',
        'Santa Cruz',
        'Santa Fe',
        'Santiago del Estero',
        'Tierra del Fuego',
        'Tucumán'
    ],
    UY: [
        'Artigas',
        'Canelones',
        'Cerro Largo',
        'Colonia',
        'Durazno',
        'Flores',
        'Florida',
        'Lavalleja',
        'Maldonado',
        'Montevideo',
        'Paysandú',
        'Río Negro (UY)',
        'Rivera',
        'Rocha',
        'Salto',
        'San José',
        'Soriano',
        'Tacuarembó',
        'Treinta y Tres'
    ],
    CL: [
        'Arica y Parinacota',
        'Tarapacá',
        'Antofagasta',
        'Atacama',
        'Coquimbo',
        'Valparaíso',
        'Metropolitana de Santiago',
        "O'Higgins",
        'Maule',
        'Ñuble',
        'Biobío',
        'La Araucanía',
        'Los Ríos',
        'Los Lagos',
        'Aysén',
        'Magallanes'
    ]
};

export const cities = {
    // ==================== ARGENTINA ====================
    'Buenos Aires': ['La Plata', 'Mar del Plata', 'Bahía Blanca', 'Tandil', 'Quilmes', 'Lanús', 'Avellaneda', 'Morón', 'San Isidro', 'Tigre', 'Pilar', 'Zárate', 'Campana', 'Luján', 'Junín', 'Pergamino', 'Olavarría', 'Necochea', 'San Nicolás', 'Chivilcoy'],
    'CABA': ['Palermo', 'Recoleta', 'Belgrano', 'Caballito', 'San Telmo', 'La Boca', 'Microcentro', 'Puerto Madero', 'Villa Crespo', 'Almagro', 'Flores', 'Villa Urquiza', 'Núñez', 'Colegiales'],
    'Córdoba': ['Córdoba Capital', 'Villa Carlos Paz', 'Río Cuarto', 'Villa María', 'Alta Gracia', 'Jesús María', 'Cosquín', 'La Falda', 'Bell Ville', 'San Francisco'],
    'Santa Fe': ['Rosario', 'Santa Fe Capital', 'Rafaela', 'Venado Tuerto', 'Reconquista', 'Villa Gobernador Gálvez', 'Esperanza', 'Casilda'],
    'Mendoza': ['Mendoza Capital', 'San Rafael', 'Godoy Cruz', 'Guaymallén', 'Las Heras', 'Maipú', 'Luján de Cuyo', 'Tunuyán', 'Malargüe'],
    'Tucumán': ['San Miguel de Tucumán', 'Yerba Buena', 'Tafí Viejo', 'Banda del Río Salí', 'Concepción', 'Famaillá', 'Monteros'],
    'Salta': ['Salta Capital', 'San Ramón de la Nueva Orán', 'Tartagal', 'General Güemes', 'Metán', 'Cafayate', 'Rosario de la Frontera'],
    'Entre Ríos': ['Paraná', 'Concordia', 'Gualeguaychú', 'Concepción del Uruguay', 'Colón', 'Victoria', 'Villaguay'],
    'Misiones': ['Posadas', 'Oberá', 'Eldorado', 'Puerto Iguazú', 'Apóstoles', 'San Vicente', 'Leandro N. Alem'],
    'Chaco': ['Resistencia', 'Presidencia Roque Sáenz Peña', 'Villa Ángela', 'Charata', 'Barranqueras', 'Fontana'],
    'Corrientes': ['Corrientes Capital', 'Goya', 'Mercedes', 'Curuzú Cuatiá', 'Paso de los Libres', 'Santo Tomé'],
    'Santiago del Estero': ['Santiago del Estero Capital', 'La Banda', 'Termas de Río Hondo', 'Añatuya', 'Frías'],
    'San Juan': ['San Juan Capital', 'Rawson', 'Rivadavia', 'Chimbas', 'Pocito', 'Caucete'],
    'Jujuy': ['San Salvador de Jujuy', 'Palpalá', 'Perico', 'Libertador General San Martín', 'San Pedro', 'La Quiaca', 'Humahuaca', 'Tilcara', 'Purmamarca'],
    'Río Negro': ['Viedma', 'San Carlos de Bariloche', 'General Roca', 'Cipolletti', 'Villa Regina', 'El Bolsón', 'Allen', 'Cinco Saltos', 'Choele Choel', 'Sierra Grande', 'Las Grutas', 'San Antonio Oeste'],
    'Neuquén': ['Neuquén Capital', 'San Martín de los Andes', 'Zapala', 'Cutral Có', 'Centenario', 'Plottier', 'Villa La Angostura', 'Junín de los Andes'],
    'Formosa': ['Formosa Capital', 'Clorinda', 'Pirané', 'El Colorado'],
    'Chubut': ['Rawson', 'Comodoro Rivadavia', 'Trelew', 'Puerto Madryn', 'Esquel', 'Gaiman', 'Sarmiento'],
    'La Pampa': ['Santa Rosa', 'General Pico', 'Toay', 'Realicó'],
    'Catamarca': ['San Fernando del Valle de Catamarca', 'Andalgalá', 'Belén', 'Tinogasta'],
    'La Rioja': ['La Rioja Capital', 'Chilecito', 'Chamical', 'Aimogasta'],
    'San Luis': ['San Luis Capital', 'Villa Mercedes', 'Merlo', 'Potrero de los Funes', 'La Punta'],
    'Santa Cruz': ['Río Gallegos', 'Caleta Olivia', 'El Calafate', 'Puerto Deseado', 'Pico Truncado', 'El Chaltén'],
    'Tierra del Fuego': ['Ushuaia', 'Río Grande', 'Tolhuin'],

    // ==================== URUGUAY ====================
    'Montevideo': ['Centro', 'Pocitos', 'Carrasco', 'Punta Carretas', 'Malvín', 'Buceo', 'Parque Rodó', 'Ciudad Vieja', 'Prado', 'La Blanqueada', 'Cordón', 'Tres Cruces'],
    'Canelones': ['Las Piedras', 'Pando', 'La Paz', 'Progreso', 'Santa Lucía', 'Sauce', 'Atlántida', 'Parque del Plata', 'Ciudad de la Costa'],
    'Maldonado': ['Maldonado Capital', 'Punta del Este', 'San Carlos', 'Piriápolis', 'Aiguá', 'Pan de Azúcar'],
    'Colonia': ['Colonia del Sacramento', 'Carmelo', 'Nueva Helvecia', 'Juan Lacaze', 'Nueva Palmira', 'Rosario'],
    'Salto': ['Salto Capital', 'Daymán', 'Constitución', 'Belén'],
    'Paysandú': ['Paysandú Capital', 'Guichón', 'Quebracho'],
    'Rivera': ['Rivera Capital', 'Tranqueras', 'Vichadero'],
    'Rocha': ['Rocha Capital', 'Castillos', 'Chuy', 'La Paloma', 'La Pedrera', 'Punta del Diablo'],
    'Tacuarembó': ['Tacuarembó Capital', 'Paso de los Toros'],
    'Artigas': ['Artigas Capital', 'Bella Unión', 'Tomás Gomensoro'],
    'Cerro Largo': ['Melo', 'Río Branco', 'Fraile Muerto'],
    'Durazno': ['Durazno Capital', 'Sarandí del Yi'],
    'Flores': ['Trinidad'],
    'Florida': ['Florida Capital', 'Sarandí Grande'],
    'Lavalleja': ['Minas', 'José Pedro Varela'],
    'Río Negro (UY)': ['Fray Bentos', 'Young', 'San Javier'],
    'San José': ['San José de Mayo', 'Libertad', 'Ciudad del Plata'],
    'Soriano': ['Mercedes', 'Dolores', 'Cardona'],
    'Treinta y Tres': ['Treinta y Tres Capital', 'Vergara'],

    // ==================== CHILE ====================
    'Arica y Parinacota': ['Arica', 'Putre'],
    'Tarapacá': ['Iquique', 'Alto Hospicio', 'Pozo Almonte', 'Pica'],
    'Antofagasta': ['Antofagasta', 'Calama', 'San Pedro de Atacama', 'Tocopilla', 'Mejillones', 'Taltal'],
    'Atacama': ['Copiapó', 'Vallenar', 'Chañaral', 'Caldera', 'Huasco'],
    'Coquimbo': ['La Serena', 'Coquimbo', 'Ovalle', 'Illapel', 'Vicuña', 'Andacollo'],
    'Valparaíso': ['Valparaíso', 'Viña del Mar', 'Quilpué', 'Villa Alemana', 'Quillota', 'San Antonio', 'Los Andes', 'La Calera', 'Limache'],
    'Metropolitana de Santiago': ['Santiago Centro', 'Providencia', 'Las Condes', 'Vitacura', 'Ñuñoa', 'La Florida', 'Maipú', 'Puente Alto', 'San Bernardo', 'La Reina', 'Peñalolén', 'Lo Barnechea'],
    "O'Higgins": ['Rancagua', 'San Fernando', 'Rengo', 'Machalí', 'Pichilemu', 'Santa Cruz'],
    'Maule': ['Talca', 'Curicó', 'Linares', 'Constitución', 'Cauquenes'],
    'Ñuble': ['Chillán', 'Chillán Viejo', 'San Carlos', 'Bulnes', 'Quirihue'],
    'Biobío': ['Concepción', 'Talcahuano', 'Los Ángeles', 'Coronel', 'Chiguayante', 'San Pedro de la Paz', 'Hualpén', 'Penco'],
    'La Araucanía': ['Temuco', 'Villarrica', 'Pucón', 'Angol', 'Victoria', 'Lautaro'],
    'Los Ríos': ['Valdivia', 'La Unión', 'Panguipulli', 'Río Bueno'],
    'Los Lagos': ['Puerto Montt', 'Osorno', 'Castro', 'Puerto Varas', 'Ancud', 'Quellón', 'Frutillar'],
    'Aysén': ['Coyhaique', 'Puerto Aysén', 'Chile Chico', 'Cochrane'],
    'Magallanes': ['Punta Arenas', 'Puerto Natales', 'Porvenir', 'Puerto Williams']
};

// Helper to get cities by province
export const getCitiesByProvince = (province) => {
    return cities[province] || [];
};

// Helper to get provinces by country
export const getProvincesByCountry = (countryCode) => {
    return provinces[countryCode] || [];
};
