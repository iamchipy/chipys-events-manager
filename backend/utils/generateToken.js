import jwt from 'jsonwebtoken'

const generateToken = (res, userId)=> {
    const token = jwt.sign({userId}, process.env.JWT_SECRET, {
        expiresIn: '30d'
    })

    // create token and place into response's cookie
    res.cookie('jwt', token, {
        httpOnly: true,
        // This check to see if we are in 'dev' and returns bool for easy bypass in dev
        secure: process.env.NODE_ENV !== 'development',
        sameSite: 'strict',
        // 30x days in sec
        // maxAge: 30*24*60*60
        maxAge: 600
    })
}
export default generateToken