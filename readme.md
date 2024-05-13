# Welcome to Chipy's Event Assistant
### Alpha testing site is now LIVE @ [Event.chipy.dev](https://Event.chipy.dev)

This MERN Stack webapp is designed to help ARK mega-tribe breeders manager the dino requests, hatching events, and announcements. If you have any interest in this please feel free to reach out to me @iamchipy or join our Discord community [Here](https://discord.gg/jvYkSRq). I'd be assist with configuration, explaination, or whatever else is needed

# Usage

1. You can start using the app by going to [Event.chipy.dev](https://Event.chipy.dev) and signing in with your Discord. 
2. Then click your name in the top right and go to your profile and make sure to select which "guild" or Discord server you are from. (If you don't select the right guild your Tribe breeders won't see your requests)
![image](https://github.com/iamchipy/chipys-Event-manager/assets/1663877/49ac4ec3-fb9f-4b8c-a301-d1ab4bf2bcb2)

3. Once you've done that you are ready to request Dinos (from the Requests page)!
![image](https://github.com/iamchipy/chipys-Event-manager/assets/1663877/0ee2b50d-56d8-4ef8-a684-6fd8d8c79e00)
4. Waiting List then shows you pending dinos and you can filter the list by user/dino
![image](https://github.com/iamchipy/chipys-Event-manager/assets/1663877/f4d083c3-ab49-496b-a36f-0d545f3e552b)
 

# Roadmap

### Current development

##### Frontend features
- [X] User features
- - [X] discord sign-in with OAuth security
- - [X] SSL certificate for HTTPS
- - [X] Profile page to set preferences
- - [X] Dino requests page
- - [X] Waiting List page
- - - [X] Filter by Dino
- - - [X] Filter by User (if you are a breeder)
- - - [X] Realtime/auto refresh tested and working
- [ ] Breeder features
- - [ ] System for breeders to add new dinos
- - [X] System for breeders permission management by Server
- - [X] System for breeders to manage a Event event
- - - [X] Event Creation
- - - [X] Event Deletion
- - - [X] Event Notes
- - - [X] Event User recommendations (by age/timezone)
- - - [X] Event Discord announcements
- - [ ] System for breeders to see/share/post current stats/lines
- - [ ] System for breeders to announce hatchings in discord
- - [X] Waiting List with dino filtering
- [X] public info
- - [X] Welcome page

##### Backend features
- [X] user database
- - [X] OAuth tokenization
- - [X] Token hashing and salting
- - [ ] Secure/Private pages locked behind tokens
- - [ ] Create additional perivilage levels
- - [X] Token TTL/invalidation
- [X] Hosting
- - [X] Database
- - [X] DNS
- - [X] Server
- - [ ] Discord bot
- - [X] SSL license for token security 
- [ ] Discord bot
- [X] Create Discord dev app for OAuth
- [ ] API
- - [X] Profile creation
- - [X] Profile modification
- - [X] Request creation
- - [X] Request modification
- - [X] Request viewing
- - [X] Event creation
- - [X] Event modification
- - [X] Event viewing
- - [X] Announcement creation
- - [ ] Announcement modification
- - [ ] Announcement viewing


### Feature Request
- [ ] Breeder rank needs to be something we can pull from Server Role (960385132194324500 example)
- [ ] Breeders would need to be able to change other user's entries
- - [ ] possibly in bulk, say 50x people all ask for unreleased dinos ahead of time

## Collaberation

I'm stil really new to MERN Stack and this is just a personal project but if you have interest do feel free to reach out to me so we can discuss or even fork this project.

# Credits

This app was created using several publicly available tool. Here are some of their links as a way to give correct credit and thanks.

- [@vitejs](https://github.com/vitejs/vite-plugin-react/tree/main)
- [@MongoDB](https://cloud.mongodb.com)
- [@Bootstrap](https://getbootstrap.com)
