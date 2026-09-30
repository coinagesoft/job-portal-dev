import api from '../api'

export const legalPagesService = {
  getPublicLegalPage: async (type) => {
    const response = await api.get(`/api/public/legal-pages/${type}`)
    return response.data
  }
}