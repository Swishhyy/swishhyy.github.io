// main.js

// Replace these with your actual Supabase Project credentials:
const SUPABASE_URL = "https://hqqxzrblekkkflfngdyt.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhxcXh6cmJsZWtra2ZsZm5nZHl0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIzOTMwNzIsImV4cCI6MjA1Nzk2OTA3Mn0.Fp9WVHWYsd5NXM6wakEUh-kJuJUXtMojBE7qYcgjVHw";
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// On page load, check if the user is already logged in
document.addEventListener("DOMContentLoaded", async () => {
    await checkUser();
    await updateVoteCount(); // If you want a global vote count
});

// 1. Sign in via GitHub
async function loginWithGitHub() {
    const { error } = await supabase.auth.signInWithOAuth({
        provider: "github",
    });
    if (error) {
        console.error("GitHub login error:", error);
    }
}

// 2. Check user status and update the page
async function checkUser() {
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (user) {
        document.getElementById("status").textContent = `Logged in as: ${user.email ?? user.user_metadata.user_name
            }`;
    } else {
        document.getElementById("status").textContent = "Not logged in.";
    }
}

// 3. Upvote (example action)
//    We "upsert" a row in a "votes" table to track that this user has voted
async function castVote() {
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        alert("You must log in first!");
        return;
    }

    // Insert or update a "votes" row with user_id = user.id
    const { error } = await supabase.from("votes").upsert({
        user_id: user.id,
        has_voted: true,
    });

    if (error) {
        console.error("Error voting:", error);
        alert("Error while voting.");
    } else {
        alert("Vote recorded!");
        await updateVoteCount(); // show updated total
    }
}

// 4. Show total votes
//    Works only if your Row-Level Security (RLS) policy allows reading all rows
async function updateVoteCount() {
    const { data, error } = await supabase
        .from("votes")
        .select("*", { count: "exact" });

    if (error) {
        console.error("Error fetching vote count:", error);
        return;
    }
    document.getElementById(
        "vote-count"
    ).textContent = `Total votes: ${data.length}`;
}

// Attach event listeners to buttons
document.getElementById("login-btn").addEventListener("click", loginWithGitHub);
document.getElementById("upvote-btn").addEventListener("click", castVote);
