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