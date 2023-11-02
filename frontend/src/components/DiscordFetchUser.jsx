const fetchUserInfo = (tokenType,accessToken) => {
    if (tokenType === undefined || accessToken === undefined) {return false}
    console.log(`Fetching User Info Started`);
    fetch('https://discord.com/api/users/@me', {
        headers: {
            authorization: `${tokenType} ${accessToken}`,
        },
    }).then(result => result.json()).then(response => {
        console.log(`UserInfo RAW ${JSON.stringify(response)}`);
        const {id, username, discriminator, avatar, global_name} = response;
        return {
            id: id,
            username: username,
            idiscriminatord: discriminator,
            avatar: avatar,
            global_name: global_name,
        }
    }).catch(console.error);
}

const fetchUserGuilds = (tokenType,accessToken) => {
    if (tokenType === undefined || accessToken === undefined) {return false}
    console.log(`Fetching User Guilds Started`);
    fetch('https://discord.com/api/users/@me/guilds', {
        headers: {
            authorization: `${tokenType} ${accessToken}`,
        },
    }).then(result => result.json()).then(response => {
        console.log(`UserGuilds RAW ${JSON.stringify(response)}`);
        return response
    }).catch(console.error);
}

const fetchUserAll = (tokenType,accessToken) => {
    if (tokenType === undefined || accessToken === undefined) {
        console.log(`Invalid Toekn/Access skipping discord fetch`);
        return false
    }else{
        console.log(`Fetching All Started`);
    }
    
    const headers = {authorization: `${tokenType} ${accessToken}`}
    Promise.all([fetch('https://discord.com/api/users/@me', {headers}),
                 fetch('https://discord.com/api/users/@me/guilds', {headers})])
    .then(function (responses) {
        return Promise.all(responses.map(function (res) {
            return res.json()
        }))
    }).then(function (data) {
        return data
    }).catch(function (err) {
        console.error(`DiscordError406: ${err}`)
    })
}

export {fetchUserGuilds, 
        fetchUserInfo,
        fetchUserAll} 