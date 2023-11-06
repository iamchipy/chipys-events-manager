import { toast } from "react-toastify"


const GuildDisplayName = (userInfo)=>{
    if (userInfo.guild !== "" && userInfo.guild in userInfo.guilds) {
        return userInfo.guilds[userInfo.guild].name
    }  
    toast.error("Please go to PROFILE and select a server!")
    return "Please Select Discord!"
}

export default GuildDisplayName