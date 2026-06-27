import { supabase } from "./lib/supabase";
import { useState, useEffect } from "react";
import heroGirl from "./assets/hero-girl-fireworks.png";

import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import "./App.css";




function Home() {
  const navigate = useNavigate();

  const telegramUser =
    (window as any).Telegram?.WebApp?.initDataUnsafe?.user;

  const isAdmin = telegramUser?.id === 678312754;
  console.log("HOME INIT DATA:", (window as any).Telegram?.WebApp?.initDataUnsafe);
console.log("HOME START PARAM:", (window as any).Telegram?.WebApp?.initDataUnsafe?.start_param);
console.log("HOME URL:", window.location.href);
console.log("HOME SEARCH:", window.location.search);
console.log("HOME HASH:", window.location.hash);
  
useEffect(() => {
  const startParam =
    (window as any).Telegram?.WebApp?.initDataUnsafe?.start_param;
	
	console.log("START PARAM:", startParam);
	
	console.log(
  "INIT DATA:",
  (window as any).Telegram?.WebApp?.initDataUnsafe
);

  if (!startParam || !startParam.startsWith("contestant_")) {
    return;
  }


  const contestantId = startParam.replace("contestant_", "");
  console.log("CONTESTANT ID:", contestantId);

console.log("CALL RPC WITH ID:", Number(contestantId));

supabase.rpc("increment_contestant_link_clicks", {
  p_id: Number(contestantId),
}).then((res) => {
  console.log("RPC RESULT:", res);
});

  const alreadyHandled = sessionStorage.getItem(`startapp_${startParam}`);

  if (alreadyHandled) {
    return;
  }

  sessionStorage.setItem(`startapp_${startParam}`, "1");

  navigate(`/contestant/${contestantId}`);
}, [navigate]);

  return (
    <div className="page home-page">
      <h1 className="premium-title">
	  <span className="premium-crown"></span>
	  <span className="premium-title-text">MISS TELEGRAM</span>
	   <span className="premium-crown"></span>
	  </h1>
      <p>Международный конкурс красоты</p>

      <div className="home-hero">
        <div className="home-hero-text">
          <h2>🌍 Новый сезон</h2>
          <div className="home-year">2026</div>
          <p>Регистрируйся, участвуй и побеждай!</p>

          <button className="vote-btn home-main-btn" onClick={() => navigate("/apply")}>
            Отправить заявку
          </button>
        </div>

        <img className="home-girl" src={heroGirl} alt="MISS TELEGRAM" />
      </div>

      <div className="home-grid">
        <div className="home-small-card" onClick={() => navigate("/my-applications")}>
          <h2>📝 Мои заявки</h2>
          <p>Посмотреть свои заявки ›</p>
        </div>

        <div className="home-small-card" onClick={() => navigate("/contestants")}>
          <h2>👥 Участницы</h2>
          <p>Смотри и поддерживай ›</p>
        </div>
      </div>

      <div className="home-wide-card" onClick={() => navigate("/ambassador")}>
        <div className="home-icon">🤝</div>
        <div>
          <h2>Амбассадор</h2>
          <p>Приглашай участниц и зрителей  ›</p>
        </div>
      </div>

      <div className="home-wide-card" onClick={() => navigate("/rules")}>
        <div className="home-icon">📜</div>
        <div>
          <h2>Условия конкурса</h2>
          <p>
            • Правила участия<br />
            • Призовой фонд<br />
            • Выплаты<br />
            • Модерация ›
          </p>
        </div>
      </div>

      {isAdmin && (
        <div className="home-wide-card" onClick={() => navigate("/admin")}>
          <div className="home-icon">👮</div>
          <div>
            <h2>Модераторы</h2>
            <p>Панель управления модераторами ›</p>
          </div>
        </div>
      )}

      <h2 className="home-section-title">Конкурс в цифрах</h2>

      <div className="home-stats">
        <div>
          <div>👑</div>
          <strong>500+</strong>
          <span>Участниц</span>
        </div>

        <div>
          <div>⭐</div>
          <strong>25K+</strong>
          <span>Голосов</span>
        </div>

        <div>
          <div>🎁</div>
          <strong>10K+</strong>
          <span>Подарков</span>
        </div>

        <div>
          <div>👥</div>
          <strong>50K+</strong>
          <span>Зрителей</span>
        </div>
      </div>
    </div>
  );
}

function Admin() {
  const [telegramId, setTelegramId] = useState("");
  const [name, setName] = useState("");
  const [moderators, setModerators] = useState<any[]>([]);
  const [message, setMessage] = useState("");

  const telegramUser =
    (window as any).Telegram?.WebApp?.initDataUnsafe?.user;

  const isAdmin = telegramUser?.id === 678312754;

  async function loadModerators() {
    const { data, error } = await supabase
      .from("moderators")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.log(error);
      return;
    }

    setModerators(data || []);
  }

  useEffect(() => {
    loadModerators();
  }, []);

  async function addModerator() {
    if (!telegramId || !name) {
      setMessage("Введите Telegram ID и имя");
      return;
    }

    const { error } = await supabase.from("moderators").insert({
      telegram_id: Number(telegramId),
      name,
      role: "moderator",
    });

    if (error) {
      console.log(error);
      alert(JSON.stringify(error));
      setMessage(error.message);
      return;
    }

    setTelegramId("");
    setName("");
    setMessage("Модератор добавлен ✅");
    await loadModerators();
  }

  async function deleteModerator(id: number, role: string) {
    if (role === "admin") {
      setMessage("Админа удалить нельзя");
      return;
    }

    const { error } = await supabase
      .from("moderators")
      .delete()
      .eq("id", id);

    if (error) {
      console.log(error);
      alert(JSON.stringify(error));
      setMessage(error.message);
      return;
    }

    setMessage("Модератор удалён");
    await loadModerators();
  }

  if (!isAdmin) {
    return (
      <div className="page">
        <h1>⛔ Доступ запрещён</h1>
      </div>
    );
  }

  return (
    <div className="page">
      <h1>👮 Модераторы</h1>

      <div className="card">
        <input
          className="form-input"
          placeholder="Telegram ID"
          value={telegramId}
          onChange={(e) => setTelegramId(e.target.value)}
        />

        <input
          className="form-input"
          placeholder="Имя"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <button className="vote-btn" onClick={addModerator}>
          ➕ Добавить модератора
        </button>

        {message && <p className="success-message">{message}</p>}
      </div>

      {moderators.map((moderator) => (
        <div className="card" key={moderator.id}>
          <h2>{moderator.name}</h2>
          <p>ID: {moderator.telegram_id}</p>
          <p>Роль: {moderator.role}</p>

          {moderator.role !== "admin" && (
            <button
              className="gift-btn"
              onClick={() => deleteModerator(moderator.id, moderator.role)}
            >
              🗑 Удалить
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

function Apply() {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");

  const [height, setHeight] = useState("");
  const [maritalStatus, setMaritalStatus] = useState("");

  const [aboutShort, setAboutShort] = useState("");
  const [occupation, setOccupation] = useState("");
  const [hobbies, setHobbies] = useState("");
  const [participationReason, setParticipationReason] = useState("");
  const [dream, setDream] = useState("");
  const [beautyMeaning, setBeautyMeaning] = useState("");
  const [talent, setTalent] = useState("");
  const [messageToViewers, setMessageToViewers] = useState("");
  const [socialLink, setSocialLink] = useState("");

  const [photo, setPhoto] = useState("");
  const [photo2, setPhoto2] = useState("");
  const [photo3, setPhoto3] = useState("");
  const [photo4, setPhoto4] = useState("");
  const [photo5, setPhoto5] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [existingApplication, setExistingApplication] = useState<any>(null);
  const [applicationsCount, setApplicationsCount] = useState(0);
  const [canSubmitMany, setCanSubmitMany] = useState(false);

  const [rulesAccepted, setRulesAccepted] = useState(false);
  const [mediaPermission, setMediaPermission] = useState(false);

  async function checkAccess() {
    const telegramUser =
      (window as any).Telegram?.WebApp?.initDataUnsafe?.user;

    if (!telegramUser?.id) {
      setLoading(false);
      return;
    }

    const { data: moderatorData } = await supabase
      .from("moderators")
      .select("*")
      .eq("telegram_id", telegramUser.id)
      .maybeSingle();

    const isModerator = !!moderatorData;
    setCanSubmitMany(isModerator);

    if (!isModerator) {
      const { data } = await supabase
        .from("contestants")
        .select("*")
        .eq("telegram_id", telegramUser.id)
        .order("created_at", { ascending: false });

      const applications = data || [];
      setApplicationsCount(applications.length);
      setExistingApplication(applications[0] || null);
    }

    setLoading(false);
  }

  useEffect(() => {
    checkAccess();
  }, []);

async function uploadPhoto(
  event: React.ChangeEvent<HTMLInputElement>,
  setPhotoFunction: React.Dispatch<React.SetStateAction<string>>
) {
  const file = event.target.files?.[0];

  if (!file) return;

  const telegramUser =
    (window as any).Telegram?.WebApp?.initDataUnsafe?.user;

  if (!telegramUser?.id) {
    setMessage("Откройте приложение через Telegram");
    return;
  }

  const fileExt = file.name.split(".").pop();
  const fileName = `${telegramUser.id}-${Date.now()}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from("contestant-photos")
    .upload(fileName, file);

  if (uploadError) {
    console.log(uploadError);
    setMessage(uploadError.message || "Ошибка загрузки фото");
    return;
  }

  const { data } = supabase.storage
    .from("contestant-photos")
    .getPublicUrl(fileName);

  setPhotoFunction(data.publicUrl);
}

async function uploadVideo(
  event: React.ChangeEvent<HTMLInputElement>
) {
  const file = event.target.files?.[0];

  if (!file) return;

  const telegramUser =
    (window as any).Telegram?.WebApp?.initDataUnsafe?.user;

  if (!telegramUser?.id) {
    setMessage("Откройте приложение через Telegram");
    return;
  }

  const fileExt = file.name.split(".").pop();

  const fileName =
    `${telegramUser.id}-${Date.now()}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from("contestant-videos")
    .upload(fileName, file);

  if (uploadError) {
    console.log(uploadError);
    setMessage(uploadError.message || "Ошибка загрузки видео");
    return;
  }

  const { data } = supabase.storage
    .from("contestant-videos")
    .getPublicUrl(fileName);

  setVideoUrl(data.publicUrl);
}
async function submitApplication() {
if (
  !name ||
  !age ||
  !country ||
  !city ||
  !height ||
  !maritalStatus ||
  !aboutShort ||
  !occupation ||
  !hobbies ||
  !participationReason ||
  !dream ||
  !beautyMeaning ||
  !talent ||
  !messageToViewers ||
  !photo ||
  !photo2 ||
  !photo3 ||
  !photo4 ||
  !photo5 ||
  !videoUrl
) {
  setMessage("Заполните все обязательные поля: 5 фото, и видео");
  return;
}

    if (!rulesAccepted || !mediaPermission) {
      setMessage("Нужно подтвердить согласие с правилами и разрешение на использование фото/видео");
      return;
    }

    const telegramUser =
      (window as any).Telegram?.WebApp?.initDataUnsafe?.user;

    if (!telegramUser?.id) {
      setMessage("Откройте приложение через Telegram");
      return;
    }

    if (!canSubmitMany) {
      if (applicationsCount >= 5) {
        setMessage("Лимит заявок исчерпан: максимум 5 заявок");
        return;
      }

      if (
        existingApplication &&
        existingApplication.status !== "Отклонена"
      ) {
        setMessage("У вас уже есть активная заявка");
        return;
      }
    }

    const slug =
      name.toLowerCase().trim().replace(/\s+/g, "-") + "-" + Date.now();

    const codeLetters = `${name[0] || "X"}${country[0] || "X"}${city[0] || "X"}`.toUpperCase();
    const contestantCode = `${codeLetters}-${Date.now().toString().slice(-3)}`;

    const description = `
Кратко о себе: ${aboutShort}

Чем занимается: ${occupation}

Хобби: ${hobbies}

Почему участвует: ${participationReason}

Мечта: ${dream}

Что для неё красота: ${beautyMeaning}

Главный талант: ${talent}

Обращение к зрителям: ${messageToViewers}

Соцсети: ${socialLink || "не указано"}
`;
    const telegram = (window as any).Telegram?.WebApp;
const startParam = telegram?.initDataUnsafe?.start_param || "";

const ambassadorCode =
  startParam.startsWith("amb_") ? startParam.replace("amb_", "") : null;
    const { error } = await supabase.from("contestants").insert({
      slug,
      name,
      age: Number(age),
      country,
      city,
      description,

      photo,
      photo_1: photo,
      photo_2: photo2 || null,
      photo_3: photo3 || null,
      photo_4: photo4 || null,
      photo_5: photo5 || null,
      photo_url: photo,
	  video_url: videoUrl || null,

      status: "На модерации",
      votes: 0,
      contestant_code: contestantCode,
	  ambassador_code: ambassadorCode,

      height,
      marital_status: maritalStatus,
      about_short: aboutShort,
      occupation,
      hobbies,
      participation_reason: participationReason,
      dream,
      beauty_meaning: beautyMeaning,
      talent,
      message_to_viewers: messageToViewers,
      social_link: socialLink || null,

      rules_accepted: rulesAccepted,
      media_permission: mediaPermission,

      telegram_id: telegramUser.id,
      telegram_username: telegramUser.username || null,
      telegram_first_name: telegramUser.first_name || null,
      telegram_last_name: telegramUser.last_name || null,
    });

    if (error) {
      console.log(error);
      setMessage(error?.message || "Ошибка сохранения заявки ❌");
      return;
    }

    setMessage("Заявка отправлена ✅");

    setName("");
    setAge("");
    setCountry("");
    setCity("");
    setHeight("");
    setMaritalStatus("");
    setAboutShort("");
    setOccupation("");
    setHobbies("");
    setParticipationReason("");
    setDream("");
    setBeautyMeaning("");
    setTalent("");
    setMessageToViewers("");
    setSocialLink("");
    setPhoto("");
	setPhoto2("");
    setPhoto3("");
    setPhoto4("");
    setPhoto5("");
	setVideoUrl("");
    setRulesAccepted(false);
    setMediaPermission(false);

    await checkAccess();
  }

  if (loading) {
    return (
      <div className="page">
        <h1>📝 Заявка участницы</h1>
        <div className="card">
          <h2>Загрузка...</h2>
        </div>
      </div>
    );
  }

  if (
    !canSubmitMany &&
    existingApplication &&
    existingApplication.status !== "Отклонена"
  ) {
    return (
      <div className="page">
        <h1>📝 Заявка участницы</h1>

        <div className="card">
          <img
            className="profile-photo"
            src={existingApplication.photo}
            alt={existingApplication.name}
          />

          <h2>У вас уже есть активная заявка</h2>
          <p>👑 {existingApplication.name}</p>
          <p>🆔 Код: {existingApplication.contestant_code}</p>
          <p>🎂 Возраст: {existingApplication.age}</p>
          <p>
            🌍 {existingApplication.country}, {existingApplication.city}
          </p>
          <p>📏 Рост: {existingApplication.height || "не указан"}</p>
          <p>💍 Семейное положение: {existingApplication.marital_status || "не указано"}</p>
          <p>🟡 Статус: {existingApplication.status}</p>
        </div>
      </div>
    );
  }

  if (!canSubmitMany && applicationsCount >= 5) {
    return (
      <div className="page">
        <h1>📝 Заявка участницы</h1>

        <div className="card">
          <h2>Лимит заявок исчерпан</h2>
          <p>Вы уже отправили максимум 5 заявок.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <h1>📝 Заявка участницы</h1>

      {!canSubmitMany && existingApplication?.status === "Отклонена" && (
        <div className="card">
          <h2>Предыдущая заявка отклонена</h2>
          <p>Вы можете отправить новую заявку.</p>
          <p>Использовано заявок: {applicationsCount} из 5</p>
        </div>
      )}

      <div className="card">
        <h2>Основные данные</h2>

        <input
          className="form-input"
          placeholder="Имя"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          className="form-input"
          placeholder="Возраст"
          value={age}
          onChange={(e) => setAge(e.target.value)}
        />

        <input
          className="form-input"
          placeholder="Страна"
          value={country}
          onChange={(e) => setCountry(e.target.value)}
        />

        <input
          className="form-input"
          placeholder="Город"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />

        <input
          className="form-input"
          placeholder="Рост"
          value={height}
          onChange={(e) => setHeight(e.target.value)}
        />

        <input
          className="form-input"
          placeholder="Семейное положение"
          value={maritalStatus}
          onChange={(e) => setMaritalStatus(e.target.value)}
        />
      </div>

      <div className="card">
        <h2>Анкета участницы</h2>

        <textarea
          className="form-input"
          placeholder="1. Кратко о себе"
          value={aboutShort}
          onChange={(e) => setAboutShort(e.target.value)}
        />

        <textarea
          className="form-input"
          placeholder="2. Чем вы занимаетесь?"
          value={occupation}
          onChange={(e) => setOccupation(e.target.value)}
        />

        <textarea
          className="form-input"
          placeholder="3. Ваши хобби?"
          value={hobbies}
          onChange={(e) => setHobbies(e.target.value)}
        />

        <textarea
          className="form-input"
          placeholder="4. Почему вы участвуете в MISS TELEGRAM?"
          value={participationReason}
          onChange={(e) => setParticipationReason(e.target.value)}
        />

        <textarea
          className="form-input"
          placeholder="5. Ваша мечта?"
          value={dream}
          onChange={(e) => setDream(e.target.value)}
        />

        <textarea
          className="form-input"
          placeholder="6. Что для вас красота?"
          value={beautyMeaning}
          onChange={(e) => setBeautyMeaning(e.target.value)}
        />

        <textarea
          className="form-input"
          placeholder="7. Какой ваш главный талант?"
          value={talent}
          onChange={(e) => setTalent(e.target.value)}
        />

        <textarea
          className="form-input"
          placeholder="8. Что вы хотите сказать зрителям?"
          value={messageToViewers}
          onChange={(e) => setMessageToViewers(e.target.value)}
        />

        <input
          className="form-input"
          placeholder="9. Instagram / Telegram / TikTok (необязательно)"
          value={socialLink}
          onChange={(e) => setSocialLink(e.target.value)}
        />
      </div>

<div className="card">
  <h2>Фото</h2>

  <p>📸 Фото №1 — обязательно</p>
  <input
    className="form-input"
    type="file"
    accept="image/*"
    onChange={(e) => uploadPhoto(e, setPhoto)}
  />

  <p>📸 Фото №2 — обязательно</p>
  <input
    className="form-input"
    type="file"
    accept="image/*"
    onChange={(e) => uploadPhoto(e, setPhoto2)}
  />

  <p>📸 Фото №3 — обязательно</p>
  <input
    className="form-input"
    type="file"
    accept="image/*"
    onChange={(e) => uploadPhoto(e, setPhoto3)}
  />

  <p>📸 Фото №4 — обязательно</p>
  <input
    className="form-input"
    type="file"
    accept="image/*"
    onChange={(e) => uploadPhoto(e, setPhoto4)}
  />

  <p>📸 Фото №5 — обязательно</p>
  <input
    className="form-input"
    type="file"
    accept="image/*"
    onChange={(e) => uploadPhoto(e, setPhoto5)}
  />

  {photo && (
    <img className="profile-photo" src={photo} alt="Фото заявки" />
  )}
</div>

<div className="card">
  <h2>Видео-кружочек</h2>

  <p>🎥 Видео — обязательно</p>
  <input
    className="form-input"
    type="file"
    accept="video/*"
    onChange={uploadVideo}
  />

  {videoUrl && (
    <video className="profile-photo" src={videoUrl} controls />
  )}
</div>

      <div className="card">
        <h2>Согласие</h2>

        <label>
          <input
            type="checkbox"
            checked={rulesAccepted}
            onChange={(e) => setRulesAccepted(e.target.checked)}
          />
          {" "}Я согласна с правилами конкурса
        </label>

        <br />

        <label>
          <input
            type="checkbox"
            checked={mediaPermission}
            onChange={(e) => setMediaPermission(e.target.checked)}
          />
          {" "}Разрешаю использовать мои фото и видео в рамках MISS TELEGRAM
        </label>
      </div>

      <div className="card">
        <button className="vote-btn" onClick={submitApplication}>
          🚀 Отправить заявку
        </button>

        {message && (
          <p className="success-message" style={{ whiteSpace: "pre-line" }}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
}

function MyApplications() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState("user");
  const [errorMessage, setErrorMessage] = useState("");
  const [editingApplication, setEditingApplication] = useState<any>(null);
  const [editRequests, setEditRequests] = useState<any[]>([]);
  const [mediaById, setMediaById] = useState<any>({});
  const [loadingMediaId, setLoadingMediaId] = useState<number | null>(null);

  function getTelegramUser() {
    return (window as any).Telegram?.WebApp?.initDataUnsafe?.user;
  }

  function getTelegramName(user: any) {
    return (
      `${user?.first_name || ""} ${user?.last_name || ""}`.trim() ||
      user?.username ||
      "Moderator"
    );
  }

  function startEditApplication(application: any) {
    setEditingApplication({
      ...application,
      edit_name: application.name || "",
      edit_age: application.age || "",
      edit_country: application.country || "",
      edit_city: application.city || "",
      edit_height: application.height || "",
      edit_marital_status: application.marital_status || "",
      edit_about_short: application.about_short || "",
      edit_occupation: application.occupation || "",
      edit_hobbies: application.hobbies || "",
      edit_participation_reason: application.participation_reason || "",
      edit_dream: application.dream || "",
      edit_beauty_meaning: application.beauty_meaning || "",
      edit_talent: application.talent || "",
      edit_message_to_viewers: application.message_to_viewers || "",
      edit_social_link: application.social_link || "",
      edit_photo: application.photo || application.photo_url || "",
      edit_photo_1: application.photo_1 || application.photo_url || "",
      edit_photo_2: application.photo_2 || "",
      edit_photo_3: application.photo_3 || "",
      edit_photo_4: application.photo_4 || "",
      edit_photo_5: application.photo_5 || "",
      edit_photo_url: application.photo_url || "",
      edit_video_url: application.video_url || "",
    });

    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 100);
  }

  function updateEditField(field: string, value: any) {
    setEditingApplication((prev: any) => ({
      ...prev,
      [field]: value,
    }));
  }

  async function uploadEditPhoto(
    event: React.ChangeEvent<HTMLInputElement>,
    field: string
  ) {
    const file = event.target.files?.[0];
    if (!file) return;

    const telegramUser = getTelegramUser();

    if (!telegramUser?.id) {
      setErrorMessage("Откройте приложение через Telegram");
      return;
    }

    const fileExt = file.name.split(".").pop();
    const fileName = `${telegramUser.id}-edit-${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("contestant-photos")
      .upload(fileName, file);

    if (uploadError) {
      setErrorMessage(uploadError.message || "Ошибка загрузки фото");
      return;
    }

    const { data } = supabase.storage
      .from("contestant-photos")
      .getPublicUrl(fileName);

    updateEditField(field, data.publicUrl);

    if (field === "edit_photo_1") {
      updateEditField("edit_photo", data.publicUrl);
      updateEditField("edit_photo_url", data.publicUrl);
    }
  }

  async function uploadEditVideo(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const telegramUser = getTelegramUser();

    if (!telegramUser?.id) {
      setErrorMessage("Откройте приложение через Telegram");
      return;
    }

    const fileExt = file.name.split(".").pop();
    const fileName = `${telegramUser.id}-edit-${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("contestant-videos")
      .upload(fileName, file, {
        contentType: file.type || "video/mp4",
        upsert: true,
      });

    if (uploadError) {
      setErrorMessage(uploadError.message || "Ошибка загрузки видео");
      return;
    }

    const { data } = supabase.storage
      .from("contestant-videos")
      .getPublicUrl(fileName);

    updateEditField("edit_video_url", data.publicUrl);
  }

  async function submitEditApplication() {
    if (!editingApplication) return;

    const telegramUser = getTelegramUser();

    if (!telegramUser?.id) {
      setErrorMessage("Откройте приложение через Telegram");
      return;
    }

    const hasChanges =
      editingApplication.edit_name !== editingApplication.name ||
      Number(editingApplication.edit_age) !== Number(editingApplication.age) ||
      editingApplication.edit_country !== editingApplication.country ||
      editingApplication.edit_city !== editingApplication.city ||
      editingApplication.edit_height !== editingApplication.height ||
      editingApplication.edit_marital_status !== editingApplication.marital_status ||
      editingApplication.edit_about_short !== editingApplication.about_short ||
      editingApplication.edit_occupation !== editingApplication.occupation ||
      editingApplication.edit_hobbies !== editingApplication.hobbies ||
      editingApplication.edit_participation_reason !== editingApplication.participation_reason ||
      editingApplication.edit_dream !== editingApplication.dream ||
      editingApplication.edit_beauty_meaning !== editingApplication.beauty_meaning ||
      editingApplication.edit_talent !== editingApplication.talent ||
      editingApplication.edit_message_to_viewers !== editingApplication.message_to_viewers ||
      editingApplication.edit_social_link !== editingApplication.social_link ||
      editingApplication.edit_photo_1 !== (editingApplication.photo_1 || editingApplication.photo_url) ||
      editingApplication.edit_photo_2 !== editingApplication.photo_2 ||
      editingApplication.edit_photo_3 !== editingApplication.photo_3 ||
      editingApplication.edit_photo_4 !== editingApplication.photo_4 ||
      editingApplication.edit_photo_5 !== editingApplication.photo_5 ||
      editingApplication.edit_video_url !== editingApplication.video_url;

    if (!hasChanges) {
      setErrorMessage("Сначала измените хотя бы одно поле, фото или видео");
      return;
    }

    const description = `
Кратко о себе: ${editingApplication.edit_about_short}

Чем занимается: ${editingApplication.edit_occupation}

Хобби: ${editingApplication.edit_hobbies}

Почему участвует: ${editingApplication.edit_participation_reason}

Мечта: ${editingApplication.edit_dream}

Что для неё красота: ${editingApplication.edit_beauty_meaning}

Главный талант: ${editingApplication.edit_talent}

Обращение к зрителям: ${editingApplication.edit_message_to_viewers}

Соцсети: ${editingApplication.edit_social_link}
`;

    const { error } = await supabase.from("contestant_edits").insert({
      contestant_id: editingApplication.id,
      status: "На модерации",
      name: editingApplication.edit_name,
      age: Number(editingApplication.edit_age),
      country: editingApplication.edit_country,
      city: editingApplication.edit_city,
      description,
      photo: editingApplication.edit_photo_1,
      photo_1: editingApplication.edit_photo_1,
      photo_2: editingApplication.edit_photo_2,
      photo_3: editingApplication.edit_photo_3,
      photo_4: editingApplication.edit_photo_4,
      photo_5: editingApplication.edit_photo_5,
      photo_url: editingApplication.edit_photo_1,
      video_url: editingApplication.edit_video_url,
      height: editingApplication.edit_height,
      marital_status: editingApplication.edit_marital_status,
      about_short: editingApplication.edit_about_short,
      occupation: editingApplication.edit_occupation,
      hobbies: editingApplication.edit_hobbies,
      participation_reason: editingApplication.edit_participation_reason,
      dream: editingApplication.edit_dream,
      beauty_meaning: editingApplication.edit_beauty_meaning,
      talent: editingApplication.edit_talent,
      message_to_viewers: editingApplication.edit_message_to_viewers,
      social_link: editingApplication.edit_social_link,
      telegram_id: telegramUser.id,
      telegram_username: telegramUser.username || null,
      telegram_first_name: telegramUser.first_name || null,
      telegram_last_name: telegramUser.last_name || null,
      notification_sent: false,
    });

    if (error) {
      console.log(error);
      setErrorMessage(error.message || "Ошибка отправки изменений");
      return;
    }

    setEditingApplication(null);
    setErrorMessage("");

setApplications((prev) =>
  prev.map((application) =>
    application.id === editingApplication.id
      ? {
          ...application,
          pendingEdit: true,
        }
      : application
  )
);
  }
async function loadApplicationMedia(applicationId: number) {
  setLoadingMediaId(applicationId);

  const { data, error } = await supabase
    .from("contestants")
    .select(`
      id,
      photo,
      photo_url,
      photo_1,
      photo_2,
      photo_3,
      photo_4,
      photo_5,
      video_url
    `)
    .eq("id", applicationId)
    .single();

  if (error) {
    setErrorMessage(error.message || "Ошибка загрузки фото и видео");
    setLoadingMediaId(null);
    return;
  }

  setMediaById((prev: any) => ({
    ...prev,
    [applicationId]: data,
  }));

  setLoadingMediaId(null);
}
  function shareContestant(application: any) {
    const link = `https://t.me/MissTelegramOfficialBot?startapp=contestant_${application.id}`;

    const text = `👑 Поддержите меня в международном конкурсе красоты MISS TELEGRAM!

🆔 Мой номер участницы: ${application.contestant_code || "не указан"}

Буду благодарна за ваш голос и поддержку ❤️

⭐ Голосовать и отправлять подарки можно по ссылке:
${link}`;

    const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(
      link
    )}&text=${encodeURIComponent(text)}`;

    supabase.rpc("increment_contestant_link_clicks", {
      p_id: application.id,
    });

    window.open(shareUrl, "_blank");
  }

  async function loadRole() {
    const telegramUser = getTelegramUser();

    if (!telegramUser?.id) {
      setUserRole("user");
      return "user";
    }

    if (telegramUser.id === 678312754) {
      setUserRole("admin");
      return "admin";
    }

    const { data, error } = await supabase
      .from("moderators")
      .select("role")
      .eq("telegram_id", telegramUser.id)
      .maybeSingle();

    if (error) {
      console.log(error);
      setUserRole("user");
      return "user";
    }

    const role = data?.role || "user";
    setUserRole(role);
    return role;
  }

  async function loadApplications() {
    setLoading(true);
    setErrorMessage("");

    const telegramUser = getTelegramUser();
    const role = await loadRole();

    if (!telegramUser?.id && role !== "admin") {
      setApplications([]);
      setEditRequests([]);
      setErrorMessage("Откройте раздел через Telegram Mini App");
      setLoading(false);
      return;
    }

    let query = supabase
      .from("contestants")
      .select(`
        id,
        name,
        age,
        country,
        city,
        status,
        contestant_code,
        height,
        marital_status,
        about_short,
        occupation,
        hobbies,
        participation_reason,
        dream,
        beauty_meaning,
        talent,
        message_to_viewers,
        social_link,
        views,
        link_clicks,
        telegram_id,
        moderated_by,
        moderated_by_name,
        created_at
      `)
      .order("created_at", { ascending: false })
      .limit(50);

    if (role !== "admin" && role !== "moderator") {
      query = query.eq("telegram_id", telegramUser.id).neq("status", "Отклонена");
    }

    const { data, error } = await query;

    if (error) {
      console.log("CONTESTANTS QUERY ERROR:", error);
      setErrorMessage(error.message || "Ошибка загрузки заявок");
      setApplications([]);
      setEditRequests([]);
      setLoading(false);
      return;
    }

    const applicationIds = (data || []).map((application: any) => application.id);

    const { data: pendingEditsData } = await supabase
      .from("contestant_edits")
      .select("contestant_id")
      .eq("status", "На модерации")
      .in("contestant_id", applicationIds);

    const pendingEditByContestant: any = {};

    (pendingEditsData || []).forEach((edit: any) => {
      pendingEditByContestant[edit.contestant_id] = true;
    });

    if (role === "admin" || role === "moderator") {
     const { data: editRequestsData, error: editRequestsError } = await supabase
  .from("contestant_edits")
  .select(`
  
  id,
  contestant_id,
  status,
  name,
  age,
  country,
  city,
  height,
  marital_status,
  about_short,
  occupation,
  hobbies,
  participation_reason,
  dream,
  beauty_meaning,
  talent,
  message_to_viewers,
  social_link,
  created_at
`)
        .eq("status", "На модерации")
        .order("created_at", { ascending: false });

      if (editRequestsError) {
        console.log("EDIT REQUESTS ERROR:", editRequestsError);
        setEditRequests([]);
      } else {
        setEditRequests(editRequestsData || []);
      }
    } else {
      setEditRequests([]);
    }

    const { data: votesData } = await supabase
      .from("votes")
      .select("contestant_id")
      .in("contestant_id", applicationIds);

    const { data: giftsData } = await supabase
      .from("gifts")
      .select("contestant_id, price")
      .in("contestant_id", applicationIds);

    const votesByContestant: any = {};
    const giftsByContestant: any = {};
    const giftStarsByContestant: any = {};

    (votesData || []).forEach((vote: any) => {
      votesByContestant[vote.contestant_id] =
        (votesByContestant[vote.contestant_id] || 0) + 1;
    });

    (giftsData || []).forEach((gift: any) => {
      giftsByContestant[gift.contestant_id] =
        (giftsByContestant[gift.contestant_id] || 0) + 1;

      giftStarsByContestant[gift.contestant_id] =
        (giftStarsByContestant[gift.contestant_id] || 0) + (gift.price || 0);
    });

    const applicationsWithStats = (data || []).map((application: any) => ({
      ...application,
      pendingEdit: pendingEditByContestant[application.id] || false,
      realVotes: votesByContestant[application.id] || 0,
      realGifts: giftsByContestant[application.id] || 0,
      giftStars: giftStarsByContestant[application.id] || 0,
      votePlace: null,
      giftPlace: null,
    }));

    setApplications(applicationsWithStats);
    setLoading(false);
  }

  useEffect(() => {
    loadApplications();
  }, []);

  async function approveEdit(edit: any) {
    const telegramUser = getTelegramUser();
    const { data: approvedEditData, error: editError } = await supabase
  .from("contestant_edits")
  .update({
  status: "Одобрена",
  moderated_by: telegramUser?.id,
  moderated_by_name: getTelegramName(telegramUser),
})
  .eq("id", edit.id)
  .eq("status", "На модерации")
  .select("id");

    if (editError) {
      setErrorMessage(editError.message || "Ошибка обновления редактирования");
      return;
    }
if (!approvedEditData || approvedEditData.length === 0) {
  setErrorMessage("Эта заявка уже обработана другим модератором");
  setEditRequests((prev) =>
    prev.filter((item) => item.id !== edit.id)
  );
  return;
}

const { error: updateError } = await supabase
  .from("contestants")
  .update({
    status: "Опубликована в конкурсе",
    name: edit.name,
    age: edit.age,
    country: edit.country,
    city: edit.city,
    photo: edit.photo || edit.photo_url,
    photo_1: edit.photo_1 || edit.photo_url,
    photo_2: edit.photo_2,
    photo_3: edit.photo_3,
    photo_4: edit.photo_4,
    photo_5: edit.photo_5,
    photo_url: edit.photo_url || edit.photo_1 || edit.photo,
    video_url: edit.video_url,
    height: edit.height,
    marital_status: edit.marital_status,
    about_short: edit.about_short,
    occupation: edit.occupation,
    hobbies: edit.hobbies,
    participation_reason: edit.participation_reason,
    dream: edit.dream,
    beauty_meaning: edit.beauty_meaning,
    talent: edit.talent,
    message_to_viewers: edit.message_to_viewers,
    social_link: edit.social_link,
  })
  .eq("id", edit.contestant_id);

if (updateError) {
  setErrorMessage(updateError.message || "Ошибка одобрения изменений");
  return;
}

    setEditRequests((prev) => prev.filter((item) => item.id !== edit.id));

setApplications((prev) =>
  prev.map((application) =>
    application.id === edit.contestant_id
      ? {
          ...application,
          ...edit,
          status: "Опубликована в конкурсе",
          pendingEdit: false,
        }
      : application
  )
);
  }

  async function rejectEdit(editId: number) {
    const telegramUser = getTelegramUser();
    const { data: rejectedEditData, error } = await supabase
      .from("contestant_edits")
      .update({
	    status: "Отклонена",
		moderated_by: telegramUser?.id,
		moderated_by_name: getTelegramName(telegramUser),
	})	
      .eq("id", editId)
	  .eq("status", "На модерации")
	  .select("id");

    if (error) {
      setErrorMessage(error.message || "Ошибка отклонения изменений");
      return;
    }
	
	if (!rejectedEditData || rejectedEditData.length === 0) {
	 setErrorMessage("Эта заявка уже обработана другим модератором");
	 setEditRequests((prev) => prev.filter((item) => item.id !== editId));
	 return;
	}

    await loadApplications();
  }

  async function changeStatus(id: number, newStatus: string) {
    const telegramUser = getTelegramUser();

    if (!telegramUser?.id) {
      return;
    }

    const finalStatus =
      newStatus === "Одобрена" ? "Опубликована в конкурсе" : newStatus;

    const { error } = await supabase
      .from("contestants")
      .update({
        status: finalStatus,
        moderated_by: telegramUser.id,
        moderated_by_name: getTelegramName(telegramUser),
        approval_notification_sent:
          finalStatus === "Опубликована в конкурсе" ? false : null,
        rejection_notification_sent:
          finalStatus === "Отклонена" ? false : null,
      })
      .eq("id", id);

    if (error) {
      console.log(error);
      setErrorMessage(error.message || "Ошибка изменения статуса");
      return;
    }

    await loadApplications();
  }

  if (loading) {
    return (
      <div className="page">
        <h1>📋 Заявки</h1>
        <div className="card">
          <h2>Загрузка...</h2>
        </div>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="page">
        <h1>📋 Заявки</h1>
        <div className="card">
          <h2>Ошибка</h2>
          <p>{errorMessage}</p>
        </div>

        <button className="vote-btn" onClick={() => setErrorMessage("")}>
          Закрыть ошибку
        </button>
      </div>
    );
  }

  if (editingApplication) {
    return (
      <div className="page">
        <h1>✏️ Редактировать заявку</h1>

        <div className="card">
          <input className="form-input" placeholder="Имя" value={editingApplication.edit_name} onChange={(e) => updateEditField("edit_name", e.target.value)} />
          <input className="form-input" placeholder="Возраст" value={editingApplication.edit_age} onChange={(e) => updateEditField("edit_age", e.target.value)} />
          <input className="form-input" placeholder="Страна" value={editingApplication.edit_country} onChange={(e) => updateEditField("edit_country", e.target.value)} />
          <input className="form-input" placeholder="Город" value={editingApplication.edit_city} onChange={(e) => updateEditField("edit_city", e.target.value)} />
          <input className="form-input" placeholder="Рост" value={editingApplication.edit_height} onChange={(e) => updateEditField("edit_height", e.target.value)} />
          <input className="form-input" placeholder="Семейное положение" value={editingApplication.edit_marital_status} onChange={(e) => updateEditField("edit_marital_status", e.target.value)} />
        </div>

        <div className="card">
          <textarea className="form-input" placeholder="1. Кратко о себе" value={editingApplication.edit_about_short} onChange={(e) => updateEditField("edit_about_short", e.target.value)} />
          <textarea className="form-input" placeholder="2. Чем занимается" value={editingApplication.edit_occupation} onChange={(e) => updateEditField("edit_occupation", e.target.value)} />
          <textarea className="form-input" placeholder="3. Хобби" value={editingApplication.edit_hobbies} onChange={(e) => updateEditField("edit_hobbies", e.target.value)} />
          <textarea className="form-input" placeholder="4. Почему участвует" value={editingApplication.edit_participation_reason} onChange={(e) => updateEditField("edit_participation_reason", e.target.value)} />
          <textarea className="form-input" placeholder="5. Мечта" value={editingApplication.edit_dream} onChange={(e) => updateEditField("edit_dream", e.target.value)} />
          <textarea className="form-input" placeholder="6. Что для неё красота" value={editingApplication.edit_beauty_meaning} onChange={(e) => updateEditField("edit_beauty_meaning", e.target.value)} />
          <textarea className="form-input" placeholder="7. Главный талант" value={editingApplication.edit_talent} onChange={(e) => updateEditField("edit_talent", e.target.value)} />
          <textarea className="form-input" placeholder="8. Обращение к зрителям" value={editingApplication.edit_message_to_viewers} onChange={(e) => updateEditField("edit_message_to_viewers", e.target.value)} />
          <input className="form-input" placeholder="9. Instagram / Telegram / TikTok" value={editingApplication.edit_social_link} onChange={(e) => updateEditField("edit_social_link", e.target.value)} />
        </div>

        <div className="card">
          <h2>Фото</h2>
          <p>Фото №1</p>
          <input className="form-input" type="file" accept="image/*" onChange={(e) => uploadEditPhoto(e, "edit_photo_1")} />
          <p>Фото №2</p>
          <input className="form-input" type="file" accept="image/*" onChange={(e) => uploadEditPhoto(e, "edit_photo_2")} />
          <p>Фото №3</p>
          <input className="form-input" type="file" accept="image/*" onChange={(e) => uploadEditPhoto(e, "edit_photo_3")} />
          <p>Фото №4</p>
          <input className="form-input" type="file" accept="image/*" onChange={(e) => uploadEditPhoto(e, "edit_photo_4")} />
          <p>Фото №5</p>
          <input className="form-input" type="file" accept="image/*" onChange={(e) => uploadEditPhoto(e, "edit_photo_5")} />
        </div>

        <div className="card">
          <h2>Видео</h2>
          <input className="form-input" type="file" accept="video/*" onChange={uploadEditVideo} />

          {editingApplication.edit_video_url && (
            <video className="profile-photo" controls playsInline>
              <source src={editingApplication.edit_video_url} type="video/mp4" />
            </video>
          )}
        </div>

        <div className="card">
          <button className="vote-btn" onClick={submitEditApplication}>
            🕒 Отправить изменения на модерацию
          </button>

          <button className="gift-btn" onClick={() => setEditingApplication(null)}>
            Отмена
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <h1>📋 Заявки</h1>

      {(userRole === "admin" || userRole === "moderator") &&
        editRequests.length > 0 && (
          <div className="card">
            <h2>✏️ Редактирования на модерации</h2>

            {editRequests.map((edit) => (
              <div key={edit.id} className="card">
                <h3>Заявка #{edit.contestant_id}</h3>
                <p>👑 Имя: {edit.name}</p>
                <p>🎂 Возраст: {edit.age || "не указан"}</p>
                <p>🌍 {edit.country || "не указано"}, {edit.city || "не указано"}</p>
                <p>📏 Рост: {edit.height || "не указан"}</p>
                <p>💍 Семейное положение: {edit.marital_status || "не указано"}</p>
                <p>🟡 Статус: {edit.status}</p>

                {[
                  edit.photo_1 || edit.photo_url,
                  edit.photo_2,
                  edit.photo_3,
                  edit.photo_4,
                  edit.photo_5,
                ]
                  .filter(Boolean)
                  .map((photoUrl, index) => (
                    <img
                      key={index}
                      className="profile-photo"
                      src={photoUrl}
                      alt={edit.name}
                    />
                  ))}

                {edit.video_url && (
                  <video className="profile-photo" controls playsInline>
                    <source src={edit.video_url} type="video/mp4" />
                  </video>
                )}

                <p>📝 Кратко о себе: {edit.about_short || "не указано"}</p>
                <p>💼 Чем занимается: {edit.occupation || "не указано"}</p>
                <p>🎯 Хобби: {edit.hobbies || "не указано"}</p>
                <p>❓ Почему участвует: {edit.participation_reason || "не указано"}</p>
                <p>💭 Мечта: {edit.dream || "не указано"}</p>
                <p>💎 Что для неё красота: {edit.beauty_meaning || "не указано"}</p>
                <p>⭐ Главный талант: {edit.talent || "не указано"}</p>
                <p>💌 Обращение к зрителям: {edit.message_to_viewers || "не указано"}</p>
                <p>🔗 Соцсеть: {edit.social_link || "не указано"}</p>

                <button className="vote-btn" onClick={() => approveEdit(edit)}>
                  🟢 Одобрить изменения
                </button>

                <button className="gift-btn" onClick={() => rejectEdit(edit.id)}>
                  🔴 Отклонить изменения
                </button>
              </div>
            ))}
          </div>
        )}

      {applications.length === 0 && (
        <div className="card">
          <h2>Заявок пока нет</h2>
          <p>
            {userRole === "admin" || userRole === "moderator"
              ? "Новых заявок на модерацию нет."
              : "У вас пока нет заявок."}
          </p>
        </div>
      )}

      {editRequests.length === 0 &&
  applications.map((application) => (
        <div className="card" key={application.id}>
		{!mediaById[application.id] && (
  <button
    className="vote-btn"
    onClick={() => loadApplicationMedia(application.id)}
  >
    📸 Показать фото/видео
  </button>
)}

{loadingMediaId === application.id && (
  <p>Загрузка фото/видео...</p>
)}

{mediaById[application.id] &&
  [
    mediaById[application.id].photo_1 || mediaById[application.id].photo_url,
    mediaById[application.id].photo_2,
    mediaById[application.id].photo_3,
    mediaById[application.id].photo_4,
    mediaById[application.id].photo_5,
  ]
    .filter(Boolean)
    .map((photoUrl, index) => (
      <img
        key={index}
        className="profile-photo"
        src={photoUrl}
        alt={application.name}
      />
    ))}

{mediaById[application.id]?.video_url && (
  <video className="profile-photo" controls playsInline>
    <source src={mediaById[application.id].video_url} type="video/mp4" />
  </video>
)}
          {[
            application.photo_1 || application.photo_url,
            application.photo_2,
            application.photo_3,
            application.photo_4,
            application.photo_5,
          ]
            .filter(Boolean)
            .map((photoUrl, index) => (
              <img
                key={index}
                className="profile-photo"
                src={photoUrl}
                alt={application.name}
              />
            ))}

          {application.video_url && (
            <video className="profile-photo" controls playsInline>
              <source src={application.video_url} type="video/mp4" />
            </video>
          )}

          <h2>👑 {application.name}</h2>
          <p>🆔 Код: {application.contestant_code || "не указан"}</p>
          <p>🎂 Возраст: {application.age || "не указан"}</p>
          <p>🌍 {application.country}, {application.city}</p>
          <p>📏 Рост: {application.height || "не указан"}</p>
          <p>💍 Семейное положение: {application.marital_status || "не указано"}</p>
          <p>🟡 Статус: {application.status}</p>

          {application.pendingEdit && (
            <p className="success-message">
              🕒 Изменения отправлены на модерацию
            </p>
          )}

          <hr />

          <p>⭐ Голосов: {application.realVotes}</p>
          <p>🎁 Подарков: {application.realGifts}</p>
          <p>💎 Получено Stars: {application.giftStars}</p>
          <p>🏆 Место по голосам: {application.votePlace || "после публикации"}</p>
          <p>🏆 Место по подаркам: {application.giftPlace || "после публикации"}</p>
          <p>👀 Просмотров карточки: {application.views || 0}</p>
          <p>🔗 Переходов по ссылке: {application.link_clicks || 0}</p>

          <hr />

          <h3>📝 Анкета участницы</h3>
          <p>1. Кратко о себе: {application.about_short || "не указано"}</p>
          <p>2. Чем занимается: {application.occupation || "не указано"}</p>
          <p>3. Хобби: {application.hobbies || "не указано"}</p>
          <p>4. Почему участвует: {application.participation_reason || "не указано"}</p>
          <p>5. Мечта: {application.dream || "не указано"}</p>
          <p>6. Что для неё красота: {application.beauty_meaning || "не указано"}</p>
          <p>7. Главный талант: {application.talent || "не указано"}</p>
          <p>8. Обращение к зрителям: {application.message_to_viewers || "не указано"}</p>
          <p>9. Соцсети: {application.social_link || "не указано"}</p>

          {application.status === "Опубликована в конкурсе" &&
            !application.pendingEdit && (
              <button
                className="vote-btn"
                onClick={() => startEditApplication(application)}
              >
                ✏️ Редактировать заявку
              </button>
            )}

          {application.status === "Опубликована в конкурсе" && (
            <button className="vote-btn" onClick={() => shareContestant(application)}>
              🔗 Поделиться карточкой
            </button>
          )}

          {application.moderated_by_name && (
            <p>👮 Обработал: {application.moderated_by_name}</p>
          )}

          {(userRole === "admin" || userRole === "moderator") &&
            application.status === "На модерации" && (
              <>
                <button
                  className="vote-btn"
                  onClick={() => changeStatus(application.id, "Одобрена")}
                >
                  🟢 Одобрить
                </button>

                <button
                  className="gift-btn"
                  onClick={() => changeStatus(application.id, "Отклонена")}
                >
                  🔴 Отклонить
                </button>
              </>
            )}
        </div>
      ))}
    </div>
  );
}

function Contestants() {
  const navigate = useNavigate();

  const [contestantsList, setContestantsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchCode, setSearchCode] = useState("");

  async function loadContestants() {
    setLoading(true);

    const { data: contestantsData, error: contestantsError } = await supabase
      .from("contestants")
      .select(
  "id, slug, name, country, city, contestant_code, status, created_at, photo_url, video_url"
)
      .order("created_at", { ascending: false });

    if (contestantsError) {
      console.log(contestantsError);
      setLoading(false);
      return;
    }

    const { data: votesData, error: votesError } = await supabase
      .from("votes")
      .select("contestant_id");

    if (votesError) {
      console.log(votesError);
      setLoading(false);
      return;
    }

    const { data: giftsData, error: giftsError } = await supabase
      .from("gifts")
      .select("contestant_id, price");

    if (giftsError) {
      console.log(giftsError);
      setLoading(false);
      return;
    }

    const votesByContestant: any = {};
    const giftsByContestant: any = {};
    const giftStarsByContestant: any = {};

    (votesData || []).forEach((vote: any) => {
      votesByContestant[vote.contestant_id] =
        (votesByContestant[vote.contestant_id] || 0) + 1;
    });

    (giftsData || []).forEach((gift: any) => {
      giftsByContestant[gift.contestant_id] =
        (giftsByContestant[gift.contestant_id] || 0) + 1;

      giftStarsByContestant[gift.contestant_id] =
        (giftStarsByContestant[gift.contestant_id] || 0) + (gift.price || 0);
    });

    const result = (contestantsData || [])
      .filter(
        (contestant: any) =>
          contestant.status === "Опубликована в конкурсе"
      )
      .map((contestant: any) => ({
        ...contestant,
        realVotes: votesByContestant[contestant.id] || 0,
        realGifts: giftsByContestant[contestant.id] || 0,
        giftStars: giftStarsByContestant[contestant.id] || 0,
      }))
      .sort((a: any, b: any) => {
        if (b.realVotes !== a.realVotes) {
          return b.realVotes - a.realVotes;
        }

        return (
          new Date(a.created_at).getTime() -
          new Date(b.created_at).getTime()
        );
        })
  .map((contestant: any, index: number) => ({
    ...contestant,
    place: index + 1,
  }));

    const giftRanking = [...result].sort((a: any, b: any) => {
      if (b.giftStars !== a.giftStars) {
        return b.giftStars - a.giftStars;
      }

      return (
        new Date(a.created_at).getTime() -
        new Date(b.created_at).getTime()
      );
    });

    const giftPlaceByContestant: any = {};

    giftRanking.forEach((contestant: any, index: number) => {
      giftPlaceByContestant[contestant.id] = index + 1;
    });

    const finalResult = result.map((contestant: any) => ({
      ...contestant,
      giftPlace: giftPlaceByContestant[contestant.id] || null,
    }));

    setContestantsList(finalResult);
    setLoading(false);
  }

  useEffect(() => {
    loadContestants();
  }, []);

  const filteredContestants = contestantsList.filter((contestant) => {
    const code = String(contestant.contestant_code || "").toLowerCase();
    const search = searchCode.toLowerCase().trim();

    if (!search) return true;

    return code.includes(search);
  });

  if (loading) {
    return (
      <div className="page">
        <h1>👑 Участницы</h1>
        <div className="card">
          <h2>Загрузка...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <h1>👑 Участницы</h1>

      <div className="card">
        <input
          className="form-input"
          placeholder="🔍 Поиск по коду участницы"
          value={searchCode}
          onChange={(e) => setSearchCode(e.target.value)}
        />
        <p>Введите код участницы, например: ВУО-123</p>
      </div>

      {filteredContestants.length === 0 && (
        <div className="card">
          <h2>Ничего не найдено</h2>
          <p>Проверьте код участницы.</p>
        </div>
      )}

      {filteredContestants.map((contestant) => (
        <div
          key={`${contestant.slug}-${contestant.id}`}
          className="card"
          onClick={() => navigate(`/contestant/${contestant.slug}`)}
          style={{ cursor: "pointer" }}
        >
          {contestant.photo_url ? (
            <img
              className="contestant-photo"
              src={contestant.photo_url}
              alt={contestant.name}
            />
          ) : (
            <div className="contestant-photo-placeholder">👑</div>
          )}

{contestant.video_url && (
  <video className="profile-photo" controls playsInline>
    <source src={contestant.video_url} type="video/mp4" />
  </video>
)}

          <h2>👑 {contestant.place} место — {contestant.name}</h2>

          <p>🆔 Код: {contestant.contestant_code || "не указан"}</p>
          <p>🌍 Страна: {contestant.country || "не указана"}</p>
          <p>🏙️ Город: {contestant.city || "не указан"}</p>
          <p>⭐ Голосов: {contestant.realVotes}</p>
          <p>🎁 Подарков: {contestant.realGifts}</p>
          <p>💎 Получено Stars: {contestant.giftStars}</p>
          <p>🏆 Место по подаркам: {contestant.giftPlace || "нет"}</p>
        </div>
      ))}
    </div>
  );
}

function ContestantProfile({
  balance,
  setBalance,
  spentStars,
  setSpentStars,
  sentGifts,
  setSentGifts,
}: {
  balance: number;
  setBalance: React.Dispatch<React.SetStateAction<number>>;
  spentStars: number;
  setSpentStars: React.Dispatch<React.SetStateAction<number>>;
  sentGifts: number;
  setSentGifts: React.Dispatch<React.SetStateAction<number>>;
}) {
  const { slug } = useParams();

  const [contestant, setContestant] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [votes, setVotes] = useState(0);
  const [gifts, setGifts] = useState(0);
  const [giftStars, setGiftStars] = useState(0);
  const [votePlace, setVotePlace] = useState<any>(null);
  const [giftPlace, setGiftPlace] = useState<any>(null);
  const [voteMessage, setVoteMessage] = useState("");
  const [giftMessage, setGiftMessage] = useState("");

  async function loadContestant() {
    if (!slug) {
      setLoading(false);
      return;
    }

    let query = supabase.from("contestants").select("*");

    if (/^\d+$/.test(String(slug))) {
      query = query.eq("id", Number(slug));
    } else {
      query = query.eq("slug", slug);
    }

    const { data, error } = await query.maybeSingle();

    if (error) {
      console.log(error);
      setLoading(false);
      return;
    }

    if (data?.id) {
      await supabase.rpc("increment_contestant_views", {
        p_id: Number(data.id),
      });

      setContestant({
        ...data,
        views: (data.views || 0) + 1,
      });
    } else {
      setContestant(null);
    }

    setLoading(false);
  }

  async function loadStats(contestantId: number) {
    const { data: votesData } = await supabase
      .from("votes")
      .select("contestant_id");

    const { data: giftsData } = await supabase
      .from("gifts")
      .select("contestant_id, price");

    const { data: contestantsData } = await supabase
      .from("contestants")
      .select("id, status, created_at")
      .eq("status", "Опубликована в конкурсе");

    const votesByContestant: any = {};
    const giftsByContestant: any = {};
    const giftStarsByContestant: any = {};

    (votesData || []).forEach((vote: any) => {
      votesByContestant[vote.contestant_id] =
        (votesByContestant[vote.contestant_id] || 0) + 1;
    });

    (giftsData || []).forEach((gift: any) => {
      giftsByContestant[gift.contestant_id] =
        (giftsByContestant[gift.contestant_id] || 0) + 1;

      giftStarsByContestant[gift.contestant_id] =
        (giftStarsByContestant[gift.contestant_id] || 0) + (gift.price || 0);
    });

    const voteRanking = (contestantsData || [])
      .map((item: any) => ({
        ...item,
        realVotes: votesByContestant[item.id] || 0,
      }))
      .sort((a: any, b: any) => {
        if (b.realVotes !== a.realVotes) {
          return b.realVotes - a.realVotes;
        }

        return (
          new Date(a.created_at).getTime() -
          new Date(b.created_at).getTime()
        );
      });

    const giftRanking = (contestantsData || [])
      .map((item: any) => ({
        ...item,
        giftStars: giftStarsByContestant[item.id] || 0,
      }))
      .sort((a: any, b: any) => {
        if (b.giftStars !== a.giftStars) {
          return b.giftStars - a.giftStars;
        }

        return (
          new Date(a.created_at).getTime() -
          new Date(b.created_at).getTime()
        );
      });

    const currentVotePlace =
      voteRanking.findIndex((item: any) => item.id === contestantId) + 1;

    const currentGiftPlace =
      giftRanking.findIndex((item: any) => item.id === contestantId) + 1;

    setVotes(votesByContestant[contestantId] || 0);
    setGifts(giftsByContestant[contestantId] || 0);
    setGiftStars(giftStarsByContestant[contestantId] || 0);
    setVotePlace(currentVotePlace > 0 ? currentVotePlace : null);
    setGiftPlace(currentGiftPlace > 0 ? currentGiftPlace : null);
  }

  useEffect(() => {
    loadContestant();
  }, [slug]);

  useEffect(() => {
    if (!contestant?.id) {
      return;
    }

    loadStats(contestant.id);
  }, [contestant?.id]);

  if (loading) {
    return (
      <div className="page">
        <h1>Загрузка...</h1>
      </div>
    );
  }

  if (!contestant) {
    return (
      <div className="page">
        <h1>Участница не найдена</h1>
      </div>
    );
  }

  async function vote() {
    const price = 100;

    setVoteMessage("");
    setGiftMessage("");

    if (balance < price) {
      setVoteMessage("Недостаточно Stars ⭐");
      return;
    }

    const telegramUser =
      (window as any).Telegram?.WebApp?.initDataUnsafe?.user;

    if (!telegramUser?.id) {
      setVoteMessage("Откройте приложение через Telegram");
      return;
    }

    const todayUtc = new Date().toISOString().slice(0, 10);

    const { error } = await supabase.from("votes").insert({
      contestant_id: contestant.id,
      telegram_id: telegramUser.id,
      vote_day: todayUtc,
    });

    if (error) {
      if (
        error.message.includes("one_vote_per_day") ||
        error.code === "23505"
      ) {
        setVoteMessage(
          "⭐ Вы уже голосовали за эту участницу сегодня.\n\n🕛 Следующий голос будет доступен завтра.\n\nПоддержите пока других участниц 👑"
        );
        return;
      }

      setVoteMessage(error.message);
      return;
    }

    setBalance(balance - price);
    setSpentStars(spentStars + price);

    await loadStats(contestant.id);

    setVoteMessage("🎉 Спасибо за голос! ⭐");
  }

  async function sendGift(giftName: string, price: number) {
    setVoteMessage("");
    setGiftMessage("");

    if (balance < price) {
      setGiftMessage("Недостаточно Stars ⭐");
      return;
    }

    const telegramUser =
      (window as any).Telegram?.WebApp?.initDataUnsafe?.user;

    if (!telegramUser?.id) {
      setGiftMessage("Откройте приложение через Telegram");
      return;
    }

    const { error } = await supabase.from("gifts").insert({
      contestant_id: contestant.id,
      telegram_id: telegramUser.id,
      gift_name: giftName,
      price,
    });

    if (error) {
      setGiftMessage(error.message);
      return;
    }

    setBalance(balance - price);
    setSpentStars(spentStars + price);
    setSentGifts(sentGifts + 1);

    await loadStats(contestant.id);

    setGiftMessage(`🎁 Спасибо! Подарок отправлен: ${giftName}`);
  }

  function shareContestant() {
    const link = `https://t.me/MissTelegramOfficialBot?startapp=contestant_${contestant.id}`;

    const text = `👑 Поддержите участницу MISS TELEGRAM!

🆔 Код участницы: ${contestant.contestant_code || "не указан"}

⭐ Голосовать и отправлять подарки можно по ссылке:
${link}`;

    const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(
      link
    )}&text=${encodeURIComponent(text)}`;

    window.open(shareUrl, "_blank");
  }

const photos = Array.from(
  new Set(
    [
      contestant.photo_url,
      contestant.photo_1,
      contestant.photo_2,
      contestant.photo_3,
      contestant.photo_4,
      contestant.photo_5,
    ].filter(Boolean)
  )
);

  const createdDate = contestant.created_at
    ? new Date(contestant.created_at).toLocaleDateString("ru-RU")
    : "не указана";

  return (
    <div className="page">
      <h1>👑 {contestant.name}</h1>

      <div className="card">
        
		{photos.length > 0 ? (
          <div>
            {photos.map((photoItem: string, index: number) => (
              <img
                key={`${photoItem}-${index}`}
                className="profile-photo"
                src={photoItem}
                alt={`${contestant.name} фото ${index + 1}`}
              />
            ))}
          </div>
        ) : (
          <div className="contestant-photo-placeholder">👑</div>
        )}
		
		{contestant.video_url && (
<video className="profile-photo" controls playsInline>
  <source src={contestant.video_url} type="video/mp4" />
</video>
)}
		
      </div>
      <div className="card">
        <h2>👑 {contestant.name}</h2>
        <p>🆔 Код: {contestant.contestant_code || "не указан"}</p>
        <p>📅 Дата регистрации: {createdDate}</p>
        <p>🎂 Возраст: {contestant.age || "не указан"}</p>
        <p>
          🌍 {contestant.country || "не указана"},{" "}
          {contestant.city || "не указан"}
        </p>
        <p>📏 Рост: {contestant.height || "не указан"}</p>
        <p>
          💍 Семейное положение:{" "}
          {contestant.marital_status || "не указано"}
        </p>
        <p>🟡 Статус: {contestant.status || "не указан"}</p>

        <hr />

        <p>⭐ Голосов: {votes}</p>
        <p>🎁 Подарков: {gifts}</p>
        <p>💎 Получено Stars: {giftStars}</p>
        <p>🏆 Место по голосам: {votePlace || "нет"}</p>
        <p>🏆 Место по подаркам: {giftPlace || "нет"}</p>
        <p>👀 Просмотров карточки: {contestant.views || 0}</p>
        <p>🔗 Переходов по ссылке: {contestant.link_clicks || 0}</p>

        <button className="vote-btn" onClick={shareContestant}>
          🔗 Поделиться карточкой
        </button>
      </div>

      <div className="card">
        <h2>📝 Анкета участницы</h2>
        <p>1. Кратко о себе: {contestant.about_short || "не указано"}</p>
        <p>2. Чем занимается: {contestant.occupation || "не указано"}</p>
        <p>3. Хобби: {contestant.hobbies || "не указано"}</p>
        <p>
          4. Почему участвует:{" "}
          {contestant.participation_reason || "не указано"}
        </p>
        <p>5. Мечта: {contestant.dream || "не указано"}</p>
        <p>
          6. Что для неё красота:{" "}
          {contestant.beauty_meaning || "не указано"}
        </p>
        <p>7. Главный талант: {contestant.talent || "не указано"}</p>
        <p>
          8. Обращение к зрителям:{" "}
          {contestant.message_to_viewers || "не указано"}
        </p>
        <p>9. Соцсети: {contestant.social_link || "не указано"}</p>
      </div>

      <div className="card">
        <h2>⭐ Голосование</h2>
        <p>Сейчас у участницы: {votes} голосов</p>

        <button className="vote-btn" onClick={vote}>
          ⭐ Голосовать за 100 Stars
        </button>

        {voteMessage && (
          <p className="success-message" style={{ whiteSpace: "pre-line" }}>
            {voteMessage}
          </p>
        )}
      </div>

      <div className="card">
        <h2>⭐ Мой баланс</h2>
        <p>{balance} Stars</p>
        <p>Потрачено: {spentStars} Stars</p>
      </div>

      <div className="card">
        <h2>🎁 Подарки</h2>

        {giftMessage && (
          <p className="success-message" style={{ whiteSpace: "pre-line" }}>
            {giftMessage}
          </p>
        )}

        <div className="gift-list">
          <button className="gift-btn" onClick={() => sendGift("Роза", 50)}>
            🌹 Роза — 50 Stars
          </button>

          <button className="gift-btn" onClick={() => sendGift("Букет", 100)}>
            💐 Букет — 100 Stars
          </button>

          <button className="gift-btn" onClick={() => sendGift("Мишка", 250)}>
            🧸 Мишка — 250 Stars
          </button>

          <button className="gift-btn" onClick={() => sendGift("Сердце", 300)}>
            ❤️ Сердце — 300 Stars
          </button>

          <button className="gift-btn" onClick={() => sendGift("Бриллиант", 500)}>
            💎 Бриллиант — 500 Stars
          </button>

          <button className="gift-btn" onClick={() => sendGift("Корона", 1000)}>
            👑 Корона — 1000 Stars
          </button>
        </div>
      </div>
    </div>
  );
}

function Rating() {
  const navigate = useNavigate();
  
  const [ratingList, setRatingList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchCode, setSearchCode] = useState("");

  async function getVotesCount(contestantId: number) {
    const { count, error } = await supabase
      .from("votes")
      .select("*", { count: "exact", head: true })
      .eq("contestant_id", contestantId);

    if (error) {
      console.log(error);
      return 0;
    }

    return count || 0;
  }

  async function loadRating() {
    setLoading(true);

    const { data, error } = await supabase
      .from("contestants")
      .select("*")
      .eq("status", "Опубликована в конкурсе");

    if (error) {
      console.log(error);
      setLoading(false);
      return;
    }

    const contestantsWithVotes = await Promise.all(
      (data || []).map(async (contestant) => {
        const realVotes = await getVotesCount(contestant.id);

        return {
          ...contestant,
          realVotes,
        };
      })
    );

contestantsWithVotes.sort((a: any, b: any) => {
  if (b.realVotes !== a.realVotes) {
    return b.realVotes - a.realVotes;
  }

  return (
    new Date(a.created_at).getTime() -
    new Date(b.created_at).getTime()
  );
});

const contestantsWithPlaces = contestantsWithVotes.map(
  (contestant: any, index: number) => ({
    ...contestant,
    place: index + 1,
  })
);

setRatingList(contestantsWithPlaces);
    setLoading(false);
  }

  useEffect(() => {
    loadRating();
  }, []);

  const filteredRating = ratingList.filter((contestant) => {
    const code = String(contestant.contestant_code || "").toLowerCase();
    const search = searchCode.toLowerCase().trim();

    if (!search) return true;

    return code.includes(search);
  });

  if (loading) {
    return (
      <div className="page">
        <h1>👑 MISS TELEGRAM</h1>
        <p>Рейтинг по голосам</p>

        <div className="card">
          <h2>Загрузка...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <h1>👑 MISS TELEGRAM</h1>
      <p>Рейтинг по голосам</p>

      <div className="card">
        <input
          className="form-input"
          placeholder="🔍 Поиск по коду участницы"
          value={searchCode}
          onChange={(e) => setSearchCode(e.target.value)}
        />
        <p>Введите код участницы, например: ВУО-123</p>
      </div>

      {filteredRating.length === 0 && (
        <div className="card">
          <h2>Ничего не найдено</h2>
          <p>Проверьте код участницы.</p>
        </div>
      )}

      {filteredRating.map((contestant) => (
  <div
    key={contestant.id}
    className="card"
    onClick={() => navigate(`/contestant/${contestant.id}`)}
    style={{ cursor: "pointer" }}
  >
          <h2>{contestant.place} место — {contestant.name}</h2>

          {contestant.contestant_code && (
            <p>🆔 Код: {contestant.contestant_code}</p>
          )}

          <p>🌍 {contestant.country}</p>
          <p>⭐ {contestant.realVotes} голосов</p>
		  <p>👆 Нажмите, чтобы открыть карточку участницы</p>
        </div>
      ))}
    </div>
  );
}

function Profile({
  balance,
  spentStars,
  sentGifts,
  setBalance,
}: {
  balance: number;
  spentStars: number;
  sentGifts: number;
  setBalance: React.Dispatch<React.SetStateAction<number>>;
}) {
  const [paymentMessage, setPaymentMessage] = useState("");
  const [roleText, setRoleText] = useState("👤 Участник");

  const telegramUser =
    (window as any).Telegram?.WebApp?.initDataUnsafe?.user;

  const tgUser = telegramUser || {
    first_name: "Тестовый пользователь",
    last_name: "",
    username: "test_user",
    id: 123456789,
    photo_url: "https://i.pravatar.cc/300",
  };

  const fullName = `${tgUser.first_name || ""} ${tgUser.last_name || ""}`.trim();

  async function loadUserRole() {
    const { data } = await supabase
      .from("moderators")
      .select("role")
      .eq("telegram_id", tgUser.id)
      .maybeSingle();

    if (data?.role === "admin") {
      setRoleText("👑 Админ");
      return;
    }

    if (data?.role === "moderator") {
      setRoleText("👮 Модератор");
      return;
    }

    if (data?.role === "ambassador") {
      setRoleText("⭐ Амбассадор");
      return;
    }

    setRoleText("👤 Участник");
  }

  useEffect(() => {
    loadUserRole();
  }, []);

  function buyStars() {
    const tg = (window as any).Telegram?.WebApp;

    if (!tg) {
      setBalance(balance + 100);
      setPaymentMessage("Тестовое пополнение: +100 Stars ✅");
      return;
    }

    setPaymentMessage("Telegram Mini App подключён ✅ Оплату Stars подключим следующим шагом.");
  }

  return (
    <div className="page">
      <h1>👤 Профиль</h1>

      <div className="card">
        <img
          src={tgUser.photo_url || "https://i.pravatar.cc/300"}
          alt="avatar"
          className="profile-photo"
        />

        <h2>{fullName || "Telegram User"}</h2>

        {tgUser.username && <p>@{tgUser.username}</p>}

        <p>ID: {tgUser.id}</p>
      </div>

      <div className="card">
        <h2>🏷 Моя роль</h2>
        <p>{roleText}</p>
      </div>

      <div className="card">
        <h2>⭐ Мой баланс</h2>
        <p>{balance} Stars</p>

        <button className="vote-btn" onClick={buyStars}>
          💳 Купить 100 Stars
        </button>

        {paymentMessage && <p className="success-message">{paymentMessage}</p>}
      </div>

      <div className="card">
        <h2>🎁 Отправлено подарков</h2>
        <p>{sentGifts}</p>
      </div>

      <div className="card">
        <h2>⭐ Потрачено Stars</h2>
        <p>{spentStars}</p>
      </div>
    </div>
  );
}

function StarRating() {
  const navigate = useNavigate();

  const [rating, setRating] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchCode, setSearchCode] = useState("");

  async function loadStarRating() {
    setLoading(true);

    const { data: giftData, error: giftError } = await supabase
      .from("gifts")
      .select("contestant_id, price");

    if (giftError) {
      console.log(giftError);
      setLoading(false);
      return;
    }

    const { data: contestantData, error: contestantError } = await supabase
      .from("contestants")
      .select("id, name, country, contestant_code")
      .eq("status", "Опубликована в конкурсе");

    if (contestantError) {
      console.log(contestantError);
      setLoading(false);
      return;
    }

    const starsByContestant: any = {};

    (giftData || []).forEach((gift: any) => {
      const contestantId = gift.contestant_id;
      const price = gift.price || 0;

      starsByContestant[contestantId] =
        (starsByContestant[contestantId] || 0) + price;
    });

    const result = (contestantData || [])
      .map((contestant: any) => ({
        ...contestant,
        starPoints: starsByContestant[contestant.id] || 0,
      }))
      .sort((a: any, b: any) => b.starPoints - a.starPoints)
      .map((contestant: any, index: number) => ({
        ...contestant,
        place: index + 1,
      }));

    setRating(result);
    setLoading(false);
  }

  useEffect(() => {
    loadStarRating();
  }, []);

  const filteredRating = rating.filter((contestant) => {
    const code = String(contestant.contestant_code || "").toLowerCase();
    const search = searchCode.toLowerCase().trim();

    if (!search) return true;

    return code.includes(search);
  });

  if (loading) {
    return (
      <div className="page">
        <h1>🎁 MISS TELEGRAM STAR</h1>
        <p>Рейтинг по подаркам</p>

        <div className="card">
          <h2>Загрузка...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <h1>🎁 MISS TELEGRAM STAR</h1>
      <p>Рейтинг по подаркам</p>

      <div className="card">
        <input
          className="form-input"
          placeholder="🔍 Поиск по коду участницы"
          value={searchCode}
          onChange={(e) => setSearchCode(e.target.value)}
        />
        <p>Введите код участницы, например: ВУО-123</p>
      </div>

      {filteredRating.length === 0 && (
        <div className="card">
          <h2>Ничего не найдено</h2>
          <p>Проверьте код участницы.</p>
        </div>
      )}

      {filteredRating.map((contestant) => (
        <div
          className="card"
          key={contestant.id}
          onClick={() => navigate(`/contestant/${contestant.id}`)}
          style={{ cursor: "pointer" }}
        >
          <h2>{contestant.place} место — {contestant.name}</h2>

          {contestant.contestant_code && (
            <p>🆔 Код: {contestant.contestant_code}</p>
          )}

          <p>🌍 {contestant.country}</p>
          <p>💎 {contestant.starPoints} Stars</p>
          <p>👆 Нажмите, чтобы открыть карточку участницы</p>
        </div>
      ))}
    </div>
  );
}

function Ambassador() {
  const ADMIN_TELEGRAM_ID = 678312754;

  const [showForm, setShowForm] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [sent, setSent] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [ownAmbassador, setOwnAmbassador] = useState<any>(null);
  const [participantsCount, setParticipantsCount] = useState(0);
  const [viewersCount, setViewersCount] = useState(0);
  const [votesCount, setVotesCount] = useState(0);
  const [giftsCount, setGiftsCount] = useState(0);
  const [myContestants, setMyContestants] = useState<any[]>([]);
  const [totalVotes, setTotalVotes] = useState(0);
  const [totalStars, setTotalStars] = useState(0);
  const [publishedCount, setPublishedCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [rejectedCount, setRejectedCount] = useState(0);
  const [pendingAmbassadors, setPendingAmbassadors] = useState<any[]>([]);

  const [form, setForm] = useState({
    name: "",
    country: "",
    city: "",
    main_social_link: "",
    audience_size: "",
    invite_focus: "",
    promotion_experience: "",
    reason: "",
    agreed_rules: false,
  });

  function getTelegramUser() {
    return (window as any).Telegram?.WebApp?.initDataUnsafe?.user;
  }

  function getTelegramName(user: any) {
    return (
      `${user?.first_name || ""} ${user?.last_name || ""}`.trim() ||
      user?.username ||
      "Admin"
    );
  }

  function updateField(field: string, value: any) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  async function loadAmbassadorData() {
    setLoading(true);
    setErrorMessage("");

    const telegramUser = getTelegramUser();

    if (!telegramUser?.id) {
      setLoading(false);
      return;
    }

    const { data: ownData } = await supabase
      .from("ambassadors")
      .select("*")
      .eq("telegram_id", telegramUser.id)
      .order("created_at", { ascending: false })
      .limit(1);

    setOwnAmbassador((ownData || [])[0] || null);
	const ambassador = (ownData || [])[0];

    if (ambassador?.referral_code) {
      const { count } = await supabase
        .from("contestants")
        .select("*", { count: "exact", head: true })
        .eq("ambassador_code", ambassador.referral_code);

  setParticipantsCount(count || 0);
  const { count: viewers } = await supabase
  .from("ambassador_referrals")
  .select("*", { count: "exact", head: true })
  .eq("ambassador_code", ambassador.referral_code);

setViewersCount(viewers || 0);
const { data: invitedContestants } = await supabase
  .from("contestants")
  .select("id")
  .eq("ambassador_code", ambassador.referral_code);

const invitedContestantIds = (invitedContestants || []).map(
  (contestant: any) => contestant.id
);

if (invitedContestantIds.length > 0) {
  const { count: votes } = await supabase
    .from("votes")
    .select("*", { count: "exact", head: true })
    .in("contestant_id", invitedContestantIds);

  setVotesCount(votes || 0);
} else {
  setVotesCount(0);
}
if (invitedContestantIds.length > 0) {
  const { data: giftsData } = await supabase
    .from("gifts")
    .select("price")
    .in("contestant_id", invitedContestantIds);

  const totalGifts = (giftsData || []).reduce(
    (sum: number, gift: any) => sum + (gift.price || 0),
    0
  );

  setGiftsCount(totalGifts);
} else {
  setGiftsCount(0);
}
}
const { data: myContestantsData } = await supabase
  .from("contestants")
  .select("id,name,contestant_code,status,votes,created_at")
  .eq("ambassador_code", ambassador.referral_code)
  .order("created_at", { ascending: false });

const contestantsWithStars = await Promise.all(
  (myContestantsData || []).map(async (contestant: any) => {
    const { data: giftsData } = await supabase
      .from("gifts")
      .select("price")
      .eq("contestant_id", contestant.id);

    const stars = (giftsData || []).reduce(
      (sum: number, gift: any) => sum + (gift.price || 0),
      0
    );

    return {
      ...contestant,
      stars,
    };
  })
);

setMyContestants(contestantsWithStars);
const totalVotes = contestantsWithStars.reduce(
  (sum: number, item: any) => sum + (item.votes || 0),
  0
);

const totalStars = contestantsWithStars.reduce(
  (sum: number, item: any) => sum + (item.stars || 0),
  0
);

const publishedCount = contestantsWithStars.filter(
  (x: any) => x.status === "Опубликована в конкурсе"
).length;

const pendingCount = contestantsWithStars.filter(
  (x: any) => x.status === "На модерации"
).length;

const rejectedCount = contestantsWithStars.filter(
  (x: any) => x.status === "Отклонена"
).length;

setTotalVotes(totalVotes);
setTotalStars(totalStars);
setPublishedCount(publishedCount);
setPendingCount(pendingCount);
setRejectedCount(rejectedCount);
    if (telegramUser.id === ADMIN_TELEGRAM_ID) {
      const { data: pendingData, error } = await supabase
        .from("ambassadors")
        .select("*")
        .eq("status", "На модерации")
        .order("created_at", { ascending: false });

      if (error) {
        setErrorMessage(error.message || "Ошибка загрузки амбассадоров");
        setPendingAmbassadors([]);
      } else {
        setPendingAmbassadors(pendingData || []);
      }
    }

    setLoading(false);
  }

  useEffect(() => {
    loadAmbassadorData();
  }, []);

  async function submitAmbassador() {
    const telegramUser = getTelegramUser();

    if (!telegramUser?.id) {
      setErrorMessage("Откройте приложение через Telegram");
      return;
    }

    if (!form.name || !form.country || !form.city || !form.main_social_link) {
      setErrorMessage("Заполните имя, страну, город и ссылку на соцсеть");
      return;
    }

    if (!form.agreed_rules) {
      setErrorMessage("Нужно согласиться с правилами участия");
      return;
    }

    const referralCode = `AMB-${telegramUser.id}`;

    const { data, error } = await supabase
      .from("ambassadors")
      .insert({
        telegram_id: telegramUser.id,
        telegram_username: telegramUser.username || null,
        telegram_first_name: telegramUser.first_name || null,
        telegram_last_name: telegramUser.last_name || null,
        name: form.name,
        country: form.country,
        city: form.city,
        main_social_link: form.main_social_link,
        audience_size: form.audience_size,
        invite_focus: form.invite_focus,
        promotion_experience: form.promotion_experience,
        reason: form.reason,
        agreed_rules: form.agreed_rules,
        status: "На модерации",
        referral_code: referralCode,
        notification_sent: false,
      })
      .select("*")
      .single();

    if (error) {
      setErrorMessage(error.message || "Ошибка отправки заявки");
      return;
    }

    setOwnAmbassador(data);
    setSent(true);
    setErrorMessage("");
  }

  async function approveAmbassador(ambassador: any) {
    const telegramUser = getTelegramUser();

    const { error } = await supabase
      .from("ambassadors")
      .update({
        status: "Одобрен",
        approved_at: new Date().toISOString(),
        approved_by: telegramUser?.id,
        approved_by_name: getTelegramName(telegramUser),
      })
      .eq("id", ambassador.id);

    if (error) {
      setErrorMessage(error.message || "Ошибка одобрения амбассадора");
      return;
    }

    await loadAmbassadorData();
  }

  async function rejectAmbassador(ambassador: any) {
    const telegramUser = getTelegramUser();

    const { error } = await supabase
      .from("ambassadors")
      .update({
        status: "Отклонён",
        rejected_at: new Date().toISOString(),
        rejected_by: telegramUser?.id,
        rejected_by_name: getTelegramName(telegramUser),
      })
      .eq("id", ambassador.id);

    if (error) {
      setErrorMessage(error.message || "Ошибка отклонения амбассадора");
      return;
    }

    await loadAmbassadorData();
  }

  if (loading) {
    return (
      <div className="page">
        <h1>🤝 Амбассадор</h1>
        <div className="card">
          <h2>Загрузка...</h2>
        </div>
      </div>
    );
  }

  if (ownAmbassador?.status === "Одобрен") {
    return (
      <div className="page">
        <h1>🤝 Кабинет амбассадора</h1>

        <div className="card">
          <h2>✅ Вы одобрены</h2>
          <p>Ваш статус: {ownAmbassador.status}</p>
          <p>Ваш реф-код: {ownAmbassador.referral_code}</p>
          <p>🔗 Реф-ссылка:</p>
<p>{`https://t.me/MissTelegramOfficialBot?startapp=amb_${ownAmbassador.referral_code}`}</p>

<button
  className="vote-btn"
  onClick={() => {
    const link = `https://t.me/MissTelegramOfficialBot?startapp=amb_${ownAmbassador.referral_code}`;
    const text = `👑 MISS TELEGRAM\n\nПрисоединяйся к конкурсу красоты в Telegram:\n${link}`;

    if ((window as any).Telegram?.WebApp?.openTelegramLink) {
      (window as any).Telegram.WebApp.openTelegramLink(
        `https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent(text)}`
      );
    } else {
      navigator.clipboard.writeText(link);
      alert("Ссылка скопирована");
    }
  }}
>
  🔗 Поделиться ссылкой
</button>
          <hr />
          <p>👑 Приглашено участниц: {participantsCount}</p>
          <p>👀 Приглашено зрителей: {viewersCount}</p>
          <p>⭐ Голосов через вас: {votesCount}</p>
          <p>🎁 Подарков через вас: {giftsCount}</p>
		  <hr />
<div className="card">

<h2>📊 Общая статистика</h2>

<p>👑 Всего приглашено: {myContestants.length}</p>

<p>🟢 Опубликовано: {publishedCount}</p>

<p>🟡 На модерации: {pendingCount}</p>

<p>🔴 Отклонено: {rejectedCount}</p>

<hr />

<p>⭐ Всего голосов: {totalVotes}</p>

<p>🎁 Всего Stars: {totalStars}</p>

</div>
<div className="card">

<h2>📊 Общая статистика</h2>

<p>👑 Всего приглашено: {myContestants.length}</p>

<p>🟢 Опубликовано: {publishedCount}</p>

<p>🟡 На модерации: {pendingCount}</p>

<p>🔴 Отклонено: {rejectedCount}</p>

<hr />

<p>⭐ Всего голосов: {totalVotes}</p>

<p>🎁 Всего Stars: {totalStars}</p>

</div>
<h3>👑 Мои приглашённые</h3>

{myContestants.length === 0 ? (
  <p>Пока нет приглашённых участниц.</p>
) : (
  myContestants.map((item) => (
    <div key={item.id} className="card">
      <h3>👑 {item.name}</h3>
      <p>🆔 Код: {item.contestant_code || "не указан"}</p>
      <p>🟡 Статус: {item.status}</p>
      <p>⭐ Голосов: {item.votes || 0}</p>
      <p>🎁 Stars: {item.stars || 0}</p>
    </div>
  ))
)}
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <h1>🤝 Амбассадор</h1>

      {errorMessage && (
        <div className="card">
          <h2>Ошибка</h2>
          <p>{errorMessage}</p>
        </div>
      )}

      {getTelegramUser()?.id === ADMIN_TELEGRAM_ID && (
        <div className="card">
          <h2>🛡 Модерация амбассадоров</h2>

          {pendingAmbassadors.length === 0 && (
            <p>Новых заявок амбассадоров нет.</p>
          )}

          {pendingAmbassadors.map((ambassador) => (
            <div className="card" key={ambassador.id}>
              <h3>🤝 {ambassador.name}</h3>
              <p>🌍 {ambassador.country}, {ambassador.city}</p>
              <p>🔗 {ambassador.main_social_link}</p>
              <p>👥 Аудитория: {ambassador.audience_size}</p>
              <p>🎯 Кого приглашает: {ambassador.invite_focus}</p>
              <p>📣 Опыт: {ambassador.promotion_experience}</p>
              <p>💬 Причина: {ambassador.reason}</p>
              <p>🆔 Telegram ID: {ambassador.telegram_id}</p>

              <button
                className="vote-btn"
                onClick={() => approveAmbassador(ambassador)}
              >
                🟢 Одобрить
              </button>

              <button
                className="gift-btn"
                onClick={() => rejectAmbassador(ambassador)}
              >
                🔴 Отклонить
              </button>
            </div>
          ))}
        </div>
      )}

      {ownAmbassador?.status === "На модерации" || sent ? (
        <div className="card">
          <h2>✅ Заявка отправлена</h2>
          <p>Ваша заявка на амбассадора отправлена на модерацию.</p>
          <p>После проверки откроется личный кабинет амбассадора.</p>
        </div>
      ) : (
        <>
          <div className="card">
            <h2>Приглашай участниц и зрителей</h2>
            <p>И получай вознаграждение за развитие MISS TELEGRAM.</p>

            {!showForm && (
              <button className="vote-btn" onClick={() => setShowForm(true)}>
                🤝 Стать амбассадором проекта
              </button>
            )}
          </div>

          {showForm && (
            <>
              <div className="card">
                <h2>📝 Анкета амбассадора</h2>

                <input className="form-input" placeholder="Ваше имя" value={form.name} onChange={(e) => updateField("name", e.target.value)} />
                <input className="form-input" placeholder="Страна" value={form.country} onChange={(e) => updateField("country", e.target.value)} />
                <input className="form-input" placeholder="Город" value={form.city} onChange={(e) => updateField("city", e.target.value)} />
                <input className="form-input" placeholder="Ссылка на Telegram / Instagram / TikTok" value={form.main_social_link} onChange={(e) => updateField("main_social_link", e.target.value)} />
                <input className="form-input" placeholder="Размер аудитории" value={form.audience_size} onChange={(e) => updateField("audience_size", e.target.value)} />
                <textarea className="form-input" placeholder="Кого планируете приглашать?" value={form.invite_focus} onChange={(e) => updateField("invite_focus", e.target.value)} />
                <textarea className="form-input" placeholder="Опыт продвижения" value={form.promotion_experience} onChange={(e) => updateField("promotion_experience", e.target.value)} />
                <textarea className="form-input" placeholder="Почему хотите стать амбассадором?" value={form.reason} onChange={(e) => updateField("reason", e.target.value)} />
              </div>

              <div className="card">
                <h2>📜 Правила участия</h2>

                <button className="gift-btn" onClick={() => setShowRules(!showRules)}>
                  {showRules ? "Скрыть правила" : "Прочитать правила"}
                </button>

                {showRules && (
                  <div>
                    <p>1. Амбассадор приглашает реальных участниц и зрителей.</p>
                    <p>2. Запрещены спам, обман, накрутки и фейковые аккаунты.</p>
                    <p>3. Вознаграждение возможно только за подтверждённую активность.</p>
                    <p>4. Администрация может отклонить заявку без объяснения причин.</p>
                    <p>5. Условия вознаграждения могут отличаться по странам и партнёрам.</p>
                  </div>
                )}

                <label>
                  <input
                    type="checkbox"
                    checked={form.agreed_rules}
                    onChange={(e) => updateField("agreed_rules", e.target.checked)}
                  />{" "}
                  Я согласен с правилами участия
                </label>
              </div>

              <button className="vote-btn" onClick={submitAmbassador}>
                🕒 Отправить заявку на модерацию
              </button>
            </>
          )}
        </>
      )}
    </div>
  );
}

function Rules() {
  return (
    <div className="page">
      <h1>📜 Условия конкурса</h1>

      <div className="card">
        <h2>Правила участия</h2>
        <p>
          • Участие 18+
          <br />
          • Фото проходят модерацию
          <br />
          • Призовые фонды будут объявлены отдельно
          <br />
          • Выплаты по правилам конкурса
        </p>
      </div>
    </div>
  );
}

function App() {
  const telegram = (window as any).Telegram?.WebApp;
  const startParam = telegram?.initDataUnsafe?.start_param || "";

  const [balance, setBalance] = useState(() => {
    return Number(localStorage.getItem("balance")) || 1250;
  });

  const [spentStars, setSpentStars] = useState(() => {
    return Number(localStorage.getItem("spentStars")) || 0;
  });

  const [sentGifts, setSentGifts] = useState(() => {
    return Number(localStorage.getItem("sentGifts")) || 38;
  });

  const [_pendingCount, setPendingCount] = useState(0);
  const [_userRole, setUserRole] = useState("user");
  
  async function saveAmbassadorReferral() {
  const telegramUser = telegram?.initDataUnsafe?.user;

  if (!startParam.startsWith("amb_")) {
    return;
  }

  if (!telegramUser?.id) {
    return;
  }

  const ambassadorCode = startParam.replace("amb_", "");

  const { error } = await supabase.from("ambassador_referrals").insert({
    ambassador_code: ambassadorCode,
    visitor_telegram_id: telegramUser.id,
    visitor_username: telegramUser.username || null,
    visitor_first_name: telegramUser.first_name || null,
    visitor_last_name: telegramUser.last_name || null,
    referral_type: "viewer",
  });

  if (error) {
    console.log("ambassador referral error:", error);
  }
}

  async function loadPendingCount() {
    const telegramUser =
      (window as any).Telegram?.WebApp?.initDataUnsafe?.user;

    if (!telegramUser?.id) {
      setPendingCount(0);
      setUserRole("user");
      return;
    }

    const { data: roleData } = await supabase
      .from("moderators")
      .select("role")
      .eq("telegram_id", telegramUser.id)
      .maybeSingle();

    const role = roleData?.role || "user";
    setUserRole(role);

    if (role !== "admin" && role !== "moderator") {
      setPendingCount(0);
      return;
    }

    const { count, error } = await supabase
      .from("contestants")
      .select("*", { count: "exact", head: true })
      .eq("status", "На модерации");

    if (error) {
      console.log(error);
      setPendingCount(0);
      return;
    }

    setPendingCount(count || 0);
  }

  useEffect(() => {
  if (startParam) {
  console.log("START PARAM:", startParam);
}
    saveAmbassadorReferral();
    const tg = (window as any).Telegram?.WebApp;

    if (tg) {
      tg.ready();
      tg.expand();
    }

    loadPendingCount();

    const interval = setInterval(() => {
      loadPendingCount();
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    localStorage.setItem("balance", String(balance));
  }, [balance]);

  useEffect(() => {
    localStorage.setItem("spentStars", String(spentStars));
  }, [spentStars]);

  useEffect(() => {
    localStorage.setItem("sentGifts", String(sentGifts));
  }, [sentGifts]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/apply" element={<Apply />} />
        <Route path="/my-applications" element={<MyApplications />} />
        <Route path="/contestants" element={<Contestants />} />
        <Route path="/admin" element={<Admin />} />

        <Route
          path="/contestant/:slug"
          element={
            <ContestantProfile
              balance={balance}
              setBalance={setBalance}
              spentStars={spentStars}
              setSpentStars={setSpentStars}
              sentGifts={sentGifts}
              setSentGifts={setSentGifts}
            />
          }
        />

        <Route path="/rating" element={<Rating />} />
		
<Route path="/star-rating" element={<StarRating />} />
<Route path="/ambassador" element={<Ambassador />} />
<Route path="/rules" element={<Rules />} />

        <Route
          path="/profile"
          element={
            <Profile
              balance={balance}
              spentStars={spentStars}
              sentGifts={sentGifts}
              setBalance={setBalance}
            />
          }
        />
      </Routes>

<nav className="bottom-nav">
  <Link to="/">🏠 Главная</Link>
  <Link to="/contestants">👑 Участницы</Link>
  <Link to="/rating">🏆 Рейтинг</Link>
  <Link to="/star-rating">🎁 STAR</Link>
  <Link to="/profile">👤 Профиль</Link>
</nav>
    </BrowserRouter>
  );
}

export default App;