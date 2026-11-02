/** Textos de presentación derivados del propósito y alcance de LuminaUL en Software I. */
export const purpose = [
  {
    label: "Nuestra misión",
    number: "01",
    title: "Acercar a quienes quieren aprender.",
    text: "Conectar a estudiantes de la Universidad de Lima para compartir conocimientos, encontrar apoyo académico y formar grupos de estudio en una comunidad cercana y de confianza.",
  },
  {
    label: "Nuestra visión",
    number: "02",
    title: "Una comunidad que crece junta.",
    text: "Que pedir ayuda y compartir lo que sabemos sea parte natural de la vida universitaria: un campus donde cada estudiante pueda encontrar compañía para seguir aprendiendo.",
  },
  {
    label: "Nuestro objetivo",
    number: "03",
    title: "Hacer más fácil encontrarse.",
    text: "Reunir publicaciones académicas, perfiles, disponibilidad y conversaciones en un mismo espacio, para que coordinar una sesión de estudio deje de ser lo más difícil del curso.",
  },
] as const;

export const questions = [
  {
    question: "¿Para quién es LuminaUL?",
    answer:
      "Para estudiantes de la Universidad de Lima que buscan apoyo académico o quieren compartir sus conocimientos con otros compañeros. El proyecto nace en Ingeniería de Sistemas y utiliza el correo institucional @aloe.ulima.edu.pe para el registro.",
  },
  {
    question: "¿Cómo empiezo a formar parte?",
    answer:
      "Crea una cuenta con tu correo institucional, completa la verificación y presenta tus intereses en tu perfil. Después puedes explorar publicaciones, crear un grupo o solicitar ingreso a uno que te interese.",
  },
  {
    question: "¿Quién puede ver el chat de un grupo?",
    answer:
      "El acceso a la conversación y al historial está reservado a sus integrantes activos. El líder revisa las solicitudes de ingreso y puede gestionar la participación del grupo.",
  },
  {
    question: "¿LuminaUL realiza pagos o reservas de cubículos?",
    answer:
      "La plataforma facilita el encuentro y la coordinación entre estudiantes. Los acuerdos de asesorías y el uso de espacios se organizan entre los participantes; LuminaUL no procesa pagos ni realiza reservas oficiales de la universidad.",
  },
] as const;

export const experiences = [
  {
    id: "apoyo",
    label: "Encuentra apoyo",
    title: "Esa duda puede ser el inicio de algo bueno.",
    description:
      "Explora publicaciones por curso y encuentra a compañeros con quienes resolver una práctica, repasar un tema o compartir lo que ya aprendiste.",
    points: [
      "Publicaciones de asesoría y grupos de estudio",
      "Búsqueda por curso y filtros",
      "Perfiles para conocer a tus compañeros",
    ],
    cta: "Explorar la comunidad",
    route: "/buscar",
  },
  {
    id: "grupo",
    label: "Arma tu grupo",
    title: "Mejor cuando cada uno aporta algo.",
    description:
      "Crea tu espacio de estudio o encuentra uno que vaya contigo. Envía una solicitud, conoce al grupo y organiza la próxima sesión desde su conversación.",
    points: [
      "Grupos con curso, modalidad y cupos",
      "Solicitudes revisadas por el líder",
      "Conversaciones en tiempo real",
    ],
    cta: "Encontrar mi grupo",
    route: "/grupos",
  },
  {
    id: "tiempo",
    label: "Haz que coincida",
    title: "Un espacio en tu horario. Una oportunidad de aprender.",
    description:
      "Comparte tu disponibilidad y consulta la de tus compañeros. Pasen del «¿cuándo puedes?» a una conversación para organizarse mejor.",
    points: [
      "Disponibilidad organizada por día",
      "Perfiles con intereses y habilidades",
      "Un lugar para coordinar con tu grupo",
    ],
    cta: "Organizar mi disponibilidad",
    route: "/horario",
  },
] as const;
