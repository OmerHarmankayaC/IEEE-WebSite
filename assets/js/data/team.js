/**
 * Board of directors, grouped by academic year.
 *
 * This is the only file you need to edit to update the "Board of Directors"
 * section on the homepage. See README.md → "Updating the team".
 *
 * - `img`      Path to a photo in assets/images/team/ (kebab-case, e.g. jane-doe.jpg).
 *              Leave empty ("") to show a plain placeholder.
 * - `linkedin` Full LinkedIn profile URL. Leave empty ("") if the person has none.
 * - `name`     Display name. Use `null` for a seat that has not been announced yet;
 *              the site then shows the localized "To be announced" label.
 * - `roleKey`  Translation key for the role (see assets/js/i18n/*.js → "team.role.*").
 *
 * Members are sorted alphabetically at render time, so order here does not matter.
 * Committee keys (cs, ras, wie, media) must match the tab ids in index.html.
 */
window.IEEE_TEAM = {
    "2025-2026": {
        presidential: [
            { name: "Umut Uygur", roleKey: "team.role.president", img: "assets/images/team/umut-uygur.jpg", linkedin: "https://www.linkedin.com/in/umut-uygur/" },
            { name: "Dilasude Özdoğan", roleKey: "team.role.vicePresident", img: "assets/images/team/dilasude-ozdogan.jpg", linkedin: "https://www.linkedin.com/in/dilasude-%C3%B6zdo%C4%9Fan-b11b303b1/" }
        ],
        committees: {
            cs: {
                leader: { name: "Eylül Akpınar", img: "assets/images/team/eylul-akpinar.jpg", linkedin: "https://www.linkedin.com/in/eyl%C3%BCl-akp%C4%B1nar-887634343/" },
                members: [
                    { name: "Enes Taşçı", roleKey: "team.role.csMember", img: "assets/images/team/enes-tasci.jpg", linkedin: "https://www.linkedin.com/in/enestsc/" },
                    { name: "Esra Eda Kılıç", roleKey: "team.role.csMember", img: "assets/images/team/esra-eda-kilic.jpg", linkedin: "https://www.linkedin.com/in/esraedak%C4%B1l%C4%B1%C3%A7/" },
                    { name: "İdil Yavuzer", roleKey: "team.role.csMember", img: "assets/images/team/idil-yavuzer.jpg", linkedin: "https://www.linkedin.com/in/idil-duru-yavuzer-3047a8322/" },
                    { name: "Yusuf Atakan Ünal", roleKey: "team.role.csMember", img: "assets/images/team/yusuf-atakan-unal.jpg", linkedin: "https://www.linkedin.com/in/yusufatakanunal/" },
                    { name: "Ömer Harmankaya", roleKey: "team.role.csMember", img: "assets/images/team/omer-harmankaya.jpg", linkedin: "https://www.linkedin.com/in/omer-harmankaya" }
                ]
            },
            ras: {
                leader: { name: "Boran Bozkurt", img: "assets/images/team/boran-bozkurt.jpg", linkedin: "https://www.linkedin.com/in/boran-bozkurt-b45a1a27b/" },
                members: [
                    { name: "Ali Rahima", roleKey: "team.role.rasMember", img: "assets/images/team/ali-rahima.jpg", linkedin: "https://www.linkedin.com/in/ali-rahima-5b1a8729b/" },
                    { name: "Harun Emre Erten", roleKey: "team.role.rasMember", img: "assets/images/team/harun-emre-erten.jpg", linkedin: "https://www.linkedin.com/in/harun-emre-erten-083653300/" },
                    { name: "İbrahim Efe Yılmaz", roleKey: "team.role.rasMember", img: "assets/images/team/ibrahim-efe-yilmaz.jpg", linkedin: "https://www.linkedin.com/in/ibrahim-efe-y%C4%B1lmaz-52a880318/" },
                    { name: "Kayra Üstten", roleKey: "team.role.rasMember", img: "assets/images/team/kayra-ustten.jpg", linkedin: "https://www.linkedin.com/in/kayra-ustten-650268313/" },
                    { name: "Batuhan Mert Korkmaz", roleKey: "team.role.rasMember", img: "assets/images/team/batuhan-mert-korkmaz.jpeg", linkedin: "https://www.linkedin.com/in/batuhanmertkorkmaz/" },
                    { name: "Furkan Aldemir", roleKey: "team.role.rasMember", img: "assets/images/team/furkan-aldemir.jpeg", linkedin: "https://www.linkedin.com/in/furkan-aldemir-a07907302/" },
                    { name: "Selin Mafizer", roleKey: "team.role.rasMember", img: "assets/images/team/selin-mafizer.jpg", linkedin: "https://www.linkedin.com/in/selin-mafizer-691b33291/" }
                ]
            },
            wie: {
                leader: { name: "İrem Akıl", img: "assets/images/team/irem-akil.jpg", linkedin: "https://www.linkedin.com/in/irem-ak%C4%B1l-9202a829a/" },
                members: [
                    { name: "Aysu Ece Atalay", roleKey: "team.role.wieMember", img: "assets/images/team/aysu-ece-atalay.jpg", linkedin: "https://www.linkedin.com/in/aysu-ece-atalay-619bb139b/" },
                    { name: "Serra Yelmenoğlu", roleKey: "team.role.wieMember", img: "assets/images/team/serra-yelmenoglu.jpg", linkedin: "https://www.linkedin.com/in/serra-yelmeno%C4%9Flu-2680743b4/" },
                    { name: "Zeynep Nil Usluoğlu", roleKey: "team.role.wieMember", img: "assets/images/team/zeynep-nil-usluoglu.jpg", linkedin: "https://www.linkedin.com/in/zeynep-nil-usluo%C4%9Flu-72a729328/" },
                    { name: "İpek Özdemir", roleKey: "team.role.wieMember", img: "assets/images/team/ipek-ozdemir.jpg", linkedin: "https://www.linkedin.com/in/ipek-%C3%B6zdemir-b1350b299/" },
                    { name: "İrem Aköz", roleKey: "team.role.wieMember", img: "assets/images/team/irem-akoz.jpg", linkedin: "https://www.linkedin.com/in/irem-ak%C3%B6z-aa7450247/" }
                ]
            },
            media: {
                leader: { name: "Duru Türkmen", img: "assets/images/team/duru-turkmen.jpg", linkedin: "https://www.linkedin.com/in/duru-t%C3%BCrkmen-756a7733a/" },
                members: [
                    { name: "Duru Baykan", roleKey: "team.role.designMember", img: "assets/images/team/duru-baykan.jpg", linkedin: "https://www.linkedin.com/in/duru-baykan-877242325/" },
                    { name: "Ece Salman", roleKey: "team.role.designMember", img: "assets/images/team/ece-salman.jpg", linkedin: "" },
                    { name: "Ela Nur Yerli", roleKey: "team.role.designMember", img: "assets/images/team/ela-nur-yerli.jpg", linkedin: "https://www.linkedin.com/in/ela-nur-yerli-927ab7324/" },
                    { name: "Simay Balaban", roleKey: "team.role.mediaMember", img: "assets/images/team/simay-balaban.jpg", linkedin: "https://www.linkedin.com/in/simay-balaban-72a40438a/" },
                    { name: "Zeynep Öztürk", roleKey: "team.role.designMember", img: "assets/images/team/zeynep-ozturk.jpg", linkedin: "https://www.linkedin.com/in/zeynep-%C3%B6zt%C3%BCrk-9bbba7302/" }
                ]
            }
        }
    },

    // Next year's board has not been announced yet. Replace the `null` names
    // (and add members) once it is.
    "2026-2027": {
        presidential: [
            { name: null, roleKey: "team.role.president", img: "", linkedin: "" },
            { name: null, roleKey: "team.role.vicePresident", img: "", linkedin: "" }
        ],
        committees: {
            cs: { leader: { name: null, img: "", linkedin: "" }, members: [] },
            ras: { leader: { name: null, img: "", linkedin: "" }, members: [] },
            wie: { leader: { name: null, img: "", linkedin: "" }, members: [] },
            media: { leader: { name: null, img: "", linkedin: "" }, members: [] }
        }
    }
};
