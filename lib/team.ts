/**
 * Board of directors, grouped by academic year.
 *
 * To publish a new board: add a new entry at the top of `terms`, put the photos in
 * public/images/team/ (firstname-lastname.jpg) and fill in the members. A term set to
 * `null` is shown as "to be announced". Members are listed alphabetically on the site.
 */

export type RoleKey =
  | "president"
  | "vicePresident"
  | "leader"
  | "csMember"
  | "rasMember"
  | "wieMember"
  | "designMember"
  | "mediaMember";

export type CommitteeId = "cs" | "ras" | "wie" | "media";

export type Member = {
  name: string;
  role: RoleKey;
  photo?: string;
  linkedin?: string;
};

export type Board = {
  presidential: Member[];
  committees: Record<CommitteeId, { leader: Member; members: Member[] }>;
};

const photo = (file: string) => `/images/team/${file}.jpg`;

export const terms: { id: string; board: Board | null }[] = [
  { id: "2026-2027", board: null },
  {
    id: "2025-2026",
    board: {
      presidential: [
        { name: "Umut Uygur", role: "president", photo: photo("umut-uygur"), linkedin: "https://www.linkedin.com/in/umut-uygur/" },
        { name: "Dilasude Özdoğan", role: "vicePresident", photo: photo("dilasude-ozdogan"), linkedin: "https://www.linkedin.com/in/dilasude-%C3%B6zdo%C4%9Fan-b11b303b1/" },
      ],
      committees: {
        cs: {
          leader: { name: "Eylül Akpınar", role: "leader", photo: photo("eylul-akpinar"), linkedin: "https://www.linkedin.com/in/eyl%C3%BCl-akp%C4%B1nar-887634343/" },
          members: [
            { name: "Enes Taşçı", role: "csMember", photo: photo("enes-tasci"), linkedin: "https://www.linkedin.com/in/enestsc/" },
            { name: "Esra Eda Kılıç", role: "csMember", photo: photo("esra-eda-kilic"), linkedin: "https://www.linkedin.com/in/esraedak%C4%B1l%C4%B1%C3%A7/" },
            { name: "İdil Yavuzer", role: "csMember", photo: photo("idil-yavuzer"), linkedin: "https://www.linkedin.com/in/idil-duru-yavuzer-3047a8322/" },
            { name: "Yusuf Atakan Ünal", role: "csMember", photo: photo("yusuf-atakan-unal"), linkedin: "https://www.linkedin.com/in/yusufatakanunal/" },
            { name: "Ömer Harmankaya", role: "csMember", photo: photo("omer-harmankaya"), linkedin: "https://www.linkedin.com/in/omer-harmankaya" },
          ],
        },
        ras: {
          leader: { name: "Boran Bozkurt", role: "leader", photo: photo("boran-bozkurt"), linkedin: "https://www.linkedin.com/in/boran-bozkurt-b45a1a27b/" },
          members: [
            { name: "Ali Rahima", role: "rasMember", photo: photo("ali-rahima"), linkedin: "https://www.linkedin.com/in/ali-rahima-5b1a8729b/" },
            { name: "Harun Emre Erten", role: "rasMember", photo: photo("harun-emre-erten"), linkedin: "https://www.linkedin.com/in/harun-emre-erten-083653300/" },
            { name: "İbrahim Efe Yılmaz", role: "rasMember", photo: photo("ibrahim-efe-yilmaz"), linkedin: "https://www.linkedin.com/in/ibrahim-efe-y%C4%B1lmaz-52a880318/" },
            { name: "Kayra Üstten", role: "rasMember", photo: photo("kayra-ustten"), linkedin: "https://www.linkedin.com/in/kayra-ustten-650268313/" },
            { name: "Batuhan Mert Korkmaz", role: "rasMember", photo: photo("batuhan-mert-korkmaz"), linkedin: "https://www.linkedin.com/in/batuhanmertkorkmaz/" },
            { name: "Furkan Aldemir", role: "rasMember", photo: photo("furkan-aldemir"), linkedin: "https://www.linkedin.com/in/furkan-aldemir-a07907302/" },
            { name: "Selin Mafizer", role: "rasMember", photo: photo("selin-mafizer"), linkedin: "https://www.linkedin.com/in/selin-mafizer-691b33291/" },
          ],
        },
        wie: {
          leader: { name: "İrem Akıl", role: "leader", photo: photo("irem-akil"), linkedin: "https://www.linkedin.com/in/irem-ak%C4%B1l-9202a829a/" },
          members: [
            { name: "Aysu Ece Atalay", role: "wieMember", photo: photo("aysu-ece-atalay"), linkedin: "https://www.linkedin.com/in/aysu-ece-atalay-619bb139b/" },
            { name: "Serra Yelmenoğlu", role: "wieMember", photo: photo("serra-yelmenoglu"), linkedin: "https://www.linkedin.com/in/serra-yelmeno%C4%9Flu-2680743b4/" },
            { name: "Zeynep Nil Usluoğlu", role: "wieMember", photo: photo("zeynep-nil-usluoglu"), linkedin: "https://www.linkedin.com/in/zeynep-nil-usluo%C4%9Flu-72a729328/" },
            { name: "İpek Özdemir", role: "wieMember", photo: photo("ipek-ozdemir"), linkedin: "https://www.linkedin.com/in/ipek-%C3%B6zdemir-b1350b299/" },
            { name: "İrem Aköz", role: "wieMember", photo: photo("irem-akoz"), linkedin: "https://www.linkedin.com/in/irem-ak%C3%B6z-aa7450247/" },
          ],
        },
        media: {
          leader: { name: "Duru Türkmen", role: "leader", photo: photo("duru-turkmen"), linkedin: "https://www.linkedin.com/in/duru-t%C3%BCrkmen-756a7733a/" },
          members: [
            { name: "Duru Baykan", role: "designMember", photo: photo("duru-baykan"), linkedin: "https://www.linkedin.com/in/duru-baykan-877242325/" },
            { name: "Ece Salman", role: "designMember", photo: photo("ece-salman") },
            { name: "Ela Nur Yerli", role: "designMember", photo: photo("ela-nur-yerli"), linkedin: "https://www.linkedin.com/in/ela-nur-yerli-927ab7324/" },
            { name: "Simay Balaban", role: "mediaMember", photo: photo("simay-balaban"), linkedin: "https://www.linkedin.com/in/simay-balaban-72a40438a/" },
            { name: "Zeynep Öztürk", role: "designMember", photo: photo("zeynep-ozturk"), linkedin: "https://www.linkedin.com/in/zeynep-%C3%B6zt%C3%BCrk-9bbba7302/" },
          ],
        },
      },
    },
  },
];

export function sortByName(members: Member[]): Member[] {
  return [...members].sort((a, b) => a.name.localeCompare(b.name, "tr"));
}
