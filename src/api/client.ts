import { httpAdapter } from './httpAdapter'
import { mockAdapter } from './mockAdapter'

const useMock = import.meta.env.VITE_USE_MOCK === 'true'

export const api = useMock ? mockAdapter : httpAdapter
