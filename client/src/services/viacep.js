import axios from "axios"

const baseUrl = "https://viacep.com.br/ws"

const api = axios.create({
  baseURL: baseUrl,
});

export async function getInfoByCep(cep){

    const apiResponse = await api.get(`/${cep}/json/`)

    return apiResponse
}