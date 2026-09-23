const SUPABASE_URL = "ТВОЙ_SUPABASE_URL";
const SUPABASE_KEY = "ТВОЙ_ANON_KEY";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

const groupSelect = document.getElementById("groupSelect");
const result = document.getElementById("result");

async function loadGroups() {
    const { data, error } = await supabaseClient
        .from("groups")
        .select("*")
        .order("name");

    if (error) {
        console.error(error);
        result.innerHTML = "<p>Ошибка загрузки групп.</p>";
        return;
    }

    groupSelect.innerHTML = "";

    data.forEach(group => {
        const option = document.createElement("option");

        option.value = group.id;
        option.textContent = group.name;

        groupSelect.appendChild(option);
    });
}

loadGroups();
async function loadToday() {

    const groupId = groupSelect.value;

    if (!groupId) {
        result.innerHTML = "<p>Выберите группу.</p>";
        return;
    }

    const today = new Date().getDay();

    const dayOfWeek = today === 0 ? 7 : today;

    const { data, error } = await supabaseClient
        .from("schedule")
        .select("*")
        .eq("group_id", groupId)
        .eq("day_of_week", dayOfWeek)
        .order("lesson_number");

    if (error) {
        console.error(error);
        result.innerHTML = "<p>Ошибка загрузки расписания.</p>";
        return;
    }

    if (data.length === 0) {
        result.innerHTML = "<p>Сегодня пар нет.</p>";
        return;
    }

    result.innerHTML = "<h2>Расписание на сегодня</h2>";

    data.forEach(lesson => {

        result.innerHTML += `
            <div class="lesson">
                <h3>${lesson.lesson_number}. ${lesson.subject_name}</h3>
                <p>${lesson.time_start} — ${lesson.time_end}</p>
            </div>
        `;
    });
}
document
    .getElementById("todayButton")
    .addEventListener("click", loadToday);
async function loadNow() {

    const groupId = groupSelect.value;

    if (!groupId) {
        result.innerHTML = "<p>Выберите группу.</p>";
        return;
    }

    const now = new Date();

    const day = now.getDay();
    const dayOfWeek = day === 0 ? 7 : day;

    const currentTime =
        now.getHours().toString().padStart(2, "0") +
        ":" +
        now.getMinutes().toString().padStart(2, "0") +
        ":00";

    const { data, error } = await supabaseClient
        .from("schedule")
        .select("*")
        .eq("group_id", groupId)
        .eq("day_of_week", dayOfWeek)
        .order("lesson_number");

    if (error) {
        console.error(error);
        result.innerHTML = "<p>Ошибка загрузки расписания.</p>";
        return;
    }

    const currentLesson = data.find(lesson => {

        return currentTime >= lesson.time_start &&
               currentTime <= lesson.time_end;
    });

    if (currentLesson) {

        result.innerHTML = `
            <div class="lesson">
                <h2>📚 Сейчас идёт ${currentLesson.lesson_number} пара</h2>

                <h3>${currentLesson.subject_name}</h3>

                <p>
                    ${currentLesson.time_start}
                    —
                    ${currentLesson.time_end}
                </p>
            </div>
        `;

        return;
    }

    const nextLesson = data.find(lesson =>
        currentTime < lesson.time_start
    );

    if (nextLesson) {

        result.innerHTML = `
            <div class="lesson">
                <h2>☕ Сейчас перемена</h2>

                <p>
                    Следующая пара:
                    <b>${nextLesson.subject_name}</b>
                </p>

                <p>
                    Начало:
                    ${nextLesson.time_start}
                </p>
            </div>
        `;

        return;
    }

    result.innerHTML = `
        <div class="lesson">
            <h2>🏠 На сегодня всё</h2>
            <p>Все пары закончились.</p>
        </div>
    `;
}
document
    .getElementById("nowButton")
    .addEventListener("click", loadNow);