/**
 * @param {import('mysql').Connection} sql
 * @param {string} query
 * @param {any} params
 * @returns {Promise<any>} 
 */
exports.query = (sql, query, params)=>{
    return new Promise((resolve, reject)=>{
        sql.query(query, params, (err,res)=>{
            if (err) return reject(err);
            else resolve(res);
        });
    });
}