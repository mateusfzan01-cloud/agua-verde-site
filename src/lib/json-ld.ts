export function getOrganizationSchema() {
  return {
    '@type': 'Organization',
    name: 'Água Verde Transfers',
    url: 'https://aguaverde.tur.br',
    telephone: '+55-81-9947-3200',
    email: 'contato@aguaverde.tur.br',
    description:
      'Transfer privado de qualidade no Recife, Porto de Galinhas e região. Motoristas profissionais, frota nova e atendimento em português, inglês e espanhol.',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Recife',
      addressRegion: 'PE',
      addressCountry: 'BR',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: -8.05428,
      longitude: -34.8813,
    },
    priceRange: 'R$ 320 – R$ 580',
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      reviewCount: '47',
    },
    sameAs: [
      'https://www.instagram.com/aguaverdeviagens/',
      'https://www.tripadvisor.com.br/Attraction_Review-g304560-d12087015-Reviews-Uluwatour_Viagens_Receptivos-Recife_State_of_Pernambuco.html',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      telephone: '+55-81-9947-3200',
      availableLanguage: ['Portuguese', 'English', 'Spanish'],
      contactOption: 'TollFree',
    },
    numberOfEmployees: { '@type': 'QuantitativeValue', value: 89 },
    foundingLocation: {
      '@type': 'Place',
      name: 'Recife',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Recife',
        addressRegion: 'PE',
        addressCountry: 'BR',
      },
    },
  }
}
