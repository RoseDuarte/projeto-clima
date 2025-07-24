export default async function handler(req, res) {
    const {city, lat, lon, unit = "metric"} = req.query;
    const apiKey = process.env.OPENWEATHER_KEY;

    let url = "";

    if(city) {
        url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=${unit}&lang=pt_br`;
    } else if(lat && lon) {
        url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=${unit}&lang=pt_br`;
    } else {
        return res.status(400).json({error: "Cidade ou coordenadas são obrigatórios."})
    }

    try {
        const response = await fetch(url);
        const data = await response.json();

        if(!response.ok) {
            return res.status(response.status).json({error: data.message});
        }

        res.status(200).json(data);
    } catch (err) {
        res.status(500).json({error: "Erro interno do servidor"})
    }

}