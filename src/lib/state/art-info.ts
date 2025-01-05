// src/stores/mediaStore.js
import { writable } from 'svelte/store';

export const description = writable('Bless deltagande på Open Art i Örebro sommaren 2017 har satt henne i positionen Sveriges just nu intressantaste graffitikonstnär. Menar jag då att det är sammanhanget som gör att måleriet blir intressant? Nej, det räcker inte att få vara med i landets kvalitétsmässigt starkaste offentliga konstevenemang som ju Open Art har etablerat sig som, man måste ju såklart delta med något vettigt också. Det har Bless gjort. Och det har hon även gjort här i Hangaren i sällskap med sin hyfsat graffititraditionella grupp LOADS CREW bestående av Gore, Mech, Bless, Big M och Bane. Text, gärna vild, dekorativ bakgrund och en fet karaktär som syftar till att lyfta figurerna. Det receptet funkar för majoriteten av graffitimålarna, runt om i världen, ivrigt inspirerade av enbart ett par av alla dynamiska stilar som ju 60-talets New York pionjärer bestod av och presenterade globalt. Kanske den största men samtidigt den mest urvattnade konstismen någonsin, även om tex Seens, Phase2 och Blades bilder fortfarande håller inte minst med tanke på den enorma mängd graffitiföljare som återfinns i deras fotspår. Bless gör en skön kommentar till detta trånga förenklandet av graffitin som företeelse. Med en figur som inte låter sig imponeras utan ser mest orolig ut för gruppens välmående. (Bless är också den enda kvinna i Loads Crew.) Hennes figur ser ut att överväga två möjligheter. Mata den gormande gubben med fisken eller slå honom med den samma? Kanske både ock Om jag låter skeptisk till denna typ av graffitimåleri så kan det bero på den mängd av 100 000-tals liknande målningar jag sett genom alla år. Jag har också sett och ser detta gruppmåleri fenomens styrka då stilmåleriet, när det som här är professionellt ger en grupp energi som känns ända in i märgen och genom sin kraft lyfter alla andra målningar som finns i dess närhet. Det är lite som med fenomenet när cyklister cyklar i grupp och där av uppbådar en gemensam energi som lyfter den enskilde att prestera mer än vad hen kunde ha gjort på egen hand. Fast visst hade man önskat att denna samlade energi även hade ett tydligt mål.');
export const audioSource = writable('https://www.idell.se/wp-content/uploads/2024/10/intro-18.28.48.mp3');
export const videoSource = writable('/test.mp4');
export const videoIsPlaying = writable(false);
export const updateDescription = (newDescription) => {
  description.set(newDescription);
};

export const updateAudioSource = (newAudioSource) => {
  audioSource.set(newAudioSource);
};