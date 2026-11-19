-- The 2025-2026 board, moved here from lib/team.ts.

insert into public.team_terms (id, published) values
  ('2026-2027', true),
  ('2025-2026', true);

insert into public.team_members (term_id, team, role, name, linkedin, photo_path, sort_order) values
  ('2025-2026', 'board', 'president', 'Umut Uygur', 'https://www.linkedin.com/in/umut-uygur/', '/images/team/umut-uygur.jpg', 0),
  ('2025-2026', 'board', 'vicePresident', 'Dilasude Özdoğan', 'https://www.linkedin.com/in/dilasude-%C3%B6zdo%C4%9Fan-b11b303b1/', '/images/team/dilasude-ozdogan.jpg', 1),
  ('2025-2026', 'cs', 'leader', 'Eylül Akpınar', 'https://www.linkedin.com/in/eyl%C3%BCl-akp%C4%B1nar-887634343/', '/images/team/eylul-akpinar.jpg', 0),
  ('2025-2026', 'cs', 'csMember', 'Enes Taşçı', 'https://www.linkedin.com/in/enestsc/', '/images/team/enes-tasci.jpg', 1),
  ('2025-2026', 'cs', 'csMember', 'Esra Eda Kılıç', 'https://www.linkedin.com/in/esraedak%C4%B1l%C4%B1%C3%A7/', '/images/team/esra-eda-kilic.jpg', 1),
  ('2025-2026', 'cs', 'csMember', 'İdil Yavuzer', 'https://www.linkedin.com/in/idil-duru-yavuzer-3047a8322/', '/images/team/idil-yavuzer.jpg', 1),
  ('2025-2026', 'cs', 'csMember', 'Yusuf Atakan Ünal', 'https://www.linkedin.com/in/yusufatakanunal/', '/images/team/yusuf-atakan-unal.jpg', 1),
  ('2025-2026', 'cs', 'csMember', 'Ömer Harmankaya', 'https://www.linkedin.com/in/omer-harmankaya', '/images/team/omer-harmankaya.jpg', 1),
  ('2025-2026', 'ras', 'leader', 'Boran Bozkurt', 'https://www.linkedin.com/in/boran-bozkurt-b45a1a27b/', '/images/team/boran-bozkurt.jpg', 0),
  ('2025-2026', 'ras', 'rasMember', 'Ali Rahima', 'https://www.linkedin.com/in/ali-rahima-5b1a8729b/', '/images/team/ali-rahima.jpg', 1),
  ('2025-2026', 'ras', 'rasMember', 'Harun Emre Erten', 'https://www.linkedin.com/in/harun-emre-erten-083653300/', '/images/team/harun-emre-erten.jpg', 1),
  ('2025-2026', 'ras', 'rasMember', 'İbrahim Efe Yılmaz', 'https://www.linkedin.com/in/ibrahim-efe-y%C4%B1lmaz-52a880318/', '/images/team/ibrahim-efe-yilmaz.jpg', 1),
  ('2025-2026', 'ras', 'rasMember', 'Kayra Üstten', 'https://www.linkedin.com/in/kayra-ustten-650268313/', '/images/team/kayra-ustten.jpg', 1),
  ('2025-2026', 'ras', 'rasMember', 'Batuhan Mert Korkmaz', 'https://www.linkedin.com/in/batuhanmertkorkmaz/', '/images/team/batuhan-mert-korkmaz.jpg', 1),
  ('2025-2026', 'ras', 'rasMember', 'Furkan Aldemir', 'https://www.linkedin.com/in/furkan-aldemir-a07907302/', '/images/team/furkan-aldemir.jpg', 1),
  ('2025-2026', 'ras', 'rasMember', 'Selin Mafizer', 'https://www.linkedin.com/in/selin-mafizer-691b33291/', '/images/team/selin-mafizer.jpg', 1),
  ('2025-2026', 'wie', 'leader', 'İrem Akıl', 'https://www.linkedin.com/in/irem-ak%C4%B1l-9202a829a/', '/images/team/irem-akil.jpg', 0),
  ('2025-2026', 'wie', 'wieMember', 'Aysu Ece Atalay', 'https://www.linkedin.com/in/aysu-ece-atalay-619bb139b/', '/images/team/aysu-ece-atalay.jpg', 1),
  ('2025-2026', 'wie', 'wieMember', 'Serra Yelmenoğlu', 'https://www.linkedin.com/in/serra-yelmeno%C4%9Flu-2680743b4/', '/images/team/serra-yelmenoglu.jpg', 1),
  ('2025-2026', 'wie', 'wieMember', 'Zeynep Nil Usluoğlu', 'https://www.linkedin.com/in/zeynep-nil-usluo%C4%9Flu-72a729328/', '/images/team/zeynep-nil-usluoglu.jpg', 1),
  ('2025-2026', 'wie', 'wieMember', 'İpek Özdemir', 'https://www.linkedin.com/in/ipek-%C3%B6zdemir-b1350b299/', '/images/team/ipek-ozdemir.jpg', 1),
  ('2025-2026', 'wie', 'wieMember', 'İrem Aköz', 'https://www.linkedin.com/in/irem-ak%C3%B6z-aa7450247/', '/images/team/irem-akoz.jpg', 1),
  ('2025-2026', 'media', 'leader', 'Duru Türkmen', 'https://www.linkedin.com/in/duru-t%C3%BCrkmen-756a7733a/', '/images/team/duru-turkmen.jpg', 0),
  ('2025-2026', 'media', 'designMember', 'Duru Baykan', 'https://www.linkedin.com/in/duru-baykan-877242325/', '/images/team/duru-baykan.jpg', 1),
  ('2025-2026', 'media', 'designMember', 'Ece Salman', null, '/images/team/ece-salman.jpg', 1),
  ('2025-2026', 'media', 'designMember', 'Ela Nur Yerli', 'https://www.linkedin.com/in/ela-nur-yerli-927ab7324/', '/images/team/ela-nur-yerli.jpg', 1),
  ('2025-2026', 'media', 'mediaMember', 'Simay Balaban', 'https://www.linkedin.com/in/simay-balaban-72a40438a/', '/images/team/simay-balaban.jpg', 1),
  ('2025-2026', 'media', 'designMember', 'Zeynep Öztürk', 'https://www.linkedin.com/in/zeynep-%C3%B6zt%C3%BCrk-9bbba7302/', '/images/team/zeynep-ozturk.jpg', 1);
