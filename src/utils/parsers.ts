import { AnimeMediaTypes } from "../typings/anime";

export function ParseSeason(animeSeason: string){
    if (!animeSeason || animeSeason === `?`) return `?`;
    let params = animeSeason.split(`_`);
    const season = {
        summer: `Лето`,
        autumn: `Осень`,
        winter: `Зима`,
        spring: `Весна`
    }
    
    return `${season[params[0]] ? `${season[params[0]]} ` : ``}${params[1]}`
}

export function ParseMediaType(mediaType: AnimeMediaTypes){
    const types = {
        tv: 'ТВ-Сериал',
        tv_special:'ТВ-Спешл',
        special: 'Спешл',
        ona: 'ONA',
        ova: 'OVA',
        movie: 'Фильм',
    }
    return types[mediaType] ?? `?`;
}