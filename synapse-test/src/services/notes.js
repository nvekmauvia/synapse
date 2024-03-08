import axios from 'axios'

const baseUrl = 'http://localhost:3001'

const getAll = async () => {
    const response = await axios.get(`${baseUrl}/data`)
    console.log(response)
    return response.data
}

const saveAll = async (data) => {
    const response = await axios.put(
        `${baseUrl}/data`,
        { notes: data },
        {
            headers: {
                'Content-Type': 'application/json'
            }
        });
    return response.data
}

/*
const createNew = async (content) => {
    const object = { content, votes: 0 }
    const response = await axios.post(baseUrl, object)
    return response.data
}

const updateAnecdote = async (id, content) => {
    const response = await axios.put(`${baseUrl}/${id}`, content)
    return response.data
}*/

export default { getAll, saveAll }