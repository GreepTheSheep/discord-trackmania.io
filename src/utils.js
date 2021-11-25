const fetch = require('node-fetch'),
    FormData = require('form-data');
/**
 * @param {import('trackmania.io').Client} tmio
 * @param {import('trackmania.io/typings/structures/TMMap')} map
 * @param {?import('mysql').Connection} sql
 * @returns {string} 
 */
exports.getMapThumbnailEmbed = async (tmio, map, sql)=>{
    let author = await map.author(),
        form = new FormData(),
        headers = new fetch.Headers();

    form.append('image', map.thumbnail);
    form.append('title', tmio.formatTMText(map.name));
    form.append('description', `Map created by ${author.name} - Used for discord-trackmania.io bot (https://github.com/GreepTheSheep/discord-trackmania.io)`);
    headers.append("Authorization", `Client-ID ${process.env.IMGUR_CLIENT_ID}`);

    if (sql == null) {
        const res = await fetch('https://api.imgur.com/3/image', { method: 'POST', headers: headers, body: form }).then(res=>res.json());
        return res.data.link;
    } else {
        return sql.query("SELECT * FROM `map_thumbnails` WHERE mapUid = ?", map.uid, async (err,res)=>{
            if (err){
                const resImgur = await fetch('https://api.imgur.com/3/image', { method: 'POST', headers: headers, body: form }).then(res=>res.json());
                return resImgur.data.link;
            } else {
                if (!res[0]){
                    const resImgur = await fetch('https://api.imgur.com/3/image', { method: 'POST', headers: headers, body: form }).then(res=>res.json());
                    sql.query("INSERT INTO `map_thumbnails` (mapUid, link) VALUES (?,?)", [map.uid, resImgur.data.link]);
                    return resImgur.data.link;
                } else {
                    return res[0].link;
                }
            }
        });
    }
}