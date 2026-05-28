import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Selector de Tipo de Alojamiento | ¿Hotel, Apartamento o Camping? | meskeIA',
  description: 'Test de 10 preguntas para saber qué tipo de alojamiento se adapta mejor a tu viaje: hotel, apartamento turístico, hostel o B&B, camping o glamping, o casa rural.',
  keywords: ['qué alojamiento elegir viaje', 'hotel o apartamento turístico', 'hostel o hotel', 'camping o glamping', 'casa rural vs hotel', 'tipo alojamiento según viaje', 'alojamiento para familias España', 'alojamiento barato viaje', 'mejor tipo alojamiento vacaciones', 'apartamento turístico vs hotel'],
  openGraph: {
    title: 'Selector de Tipo de Alojamiento — ¿Hotel, Apartamento o Camping?',
    description: 'Descubre qué tipo de alojamiento se adapta mejor a tu viaje en 10 preguntas.',
    url: 'https://meskeia.com/selector-tipo-alojamiento/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    type: 'website',
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }]
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Selector de Tipo de Alojamiento",
  description: "Test de 10 preguntas para saber qué tipo de alojamiento se adapta mejor a tu viaje: hotel, apartamento turístico, hostel o B&B, camping o glamping, o casa rural.",
  url: "https://meskeia.com/selector-tipo-alojamiento/",
  category: 'EducationalApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre un apartamento turístico y un hotel?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un hotel ofrece servicios incluidos como recepción 24 h, limpieza diaria, desayuno opcional y zonas comunes; su precio suele ser por habitación. Un apartamento turístico es una vivienda completa alquilada por estancia, con cocina equipada y mayor autonomía, pero sin servicios de hotel. Los apartamentos suelen ser más económicos para grupos o estancias largas, mientras que los hoteles aportan más comodidad y menos gestión para estancias cortas o viajes de negocio.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuándo es mejor elegir una casa rural que un hotel de playa o ciudad?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Una casa rural encaja cuando buscas tranquilidad, contacto con la naturaleza, espacio para grupos grandes (familias, amigos) o una experiencia local auténtica. Suele ser la opción más adecuada para escapadas de fin de semana al interior, rutas de senderismo o destinos sin oferta hotelera relevante. Para viajes de ciudad o playas con buena oferta, un hotel o apartamento turístico suele ser más práctico por la ubicación y los servicios disponibles.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Los hostels solo son para viajeros jóvenes con presupuesto bajo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No. Si bien los hostels tradicionales son conocidos por sus literas y su precio reducido, muchos ofrecen habitaciones privadas con baño a precios competitivos con hoteles de 2 estrellas. Son ideales para viajeros solos que quieren socializar, para destinos con poca oferta hotelera económica o para quienes priorizan el gasto en experiencias antes que en alojamiento. La edad promedio del viajero de hostel ha subido notablemente en los últimos años.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué tipo de alojamiento es mejor para viajar en familia con niños pequeños?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Para familias con niños pequeños, el apartamento turístico suele ser la mejor opción: permite cocinar, tener espacio para jugar, respetar los horarios de sueño sin molestar a otros huéspedes y reducir el gasto en restaurantes. Los hoteles con zonas infantiles o animación también funcionan bien para estancias en resort. El camping o glamping puede ser una experiencia muy positiva con niños a partir de 4-5 años si el clima lo permite.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre camping y glamping?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El camping convencional implica montar tu propia tienda o llevar autocaravana en un espacio habilitado con servicios básicos (aseos, duchas, zona de cocina). El glamping (glamorous camping) ofrece alojamiento ya instalado —tiendas safari, cabañas, burbujas transparentes, yurtas— con camas reales, electricidad y a veces baño privado, manteniendo la experiencia en la naturaleza sin renunciar a la comodidad. El glamping suele costar entre 60 € y 200 €/noche, frente a los 10-25 € del camping tradicional.',
      },
    },
  ],
};
