"""
SquadSync Comprehensive Feature & Security Verification Suite
Tests all system workflows, authorization rules, and endpoints against live backend.
"""

import asyncio
import json
import uuid
import httpx

BASE_URL = "http://127.0.0.1:8000"

results = {
    "passed": [],
    "failed": [],
    "security_findings": [],
}

async def run_suite():
    async with httpx.AsyncClient(base_url=BASE_URL, timeout=15.0) as client:
        print("=" * 60)
        print("SQUADSYNC END-TO-END FEATURE AND SECURITY TEST SUITE")
        print("=" * 60)

        # -------------------------------------------------------------
        # 1. AUTHENTICATION & SESSION
        # -------------------------------------------------------------
        print("\n--- 1. Testing Auth & Session ---")
        # 1.1 Admin login
        admin_login = await client.post("/api/v1/auth/login", json={
            "username_or_email": "admin@squadsync.gg",
            "password": "password123"
        })
        if admin_login.status_code == 200:
            admin_data = admin_login.json()
            admin_token = admin_data["data"]["access_token"]
            refresh_token = admin_data["data"]["refresh_token"]
            results["passed"].append("Auth: Admin Login (200)")
            print("  [PASS] Admin login successful")
        else:
            print("  [FAIL] Admin login failed:", admin_login.text)
            results["failed"].append(f"Auth: Admin Login ({admin_login.status_code})")
            return

        # 1.2 ProGamer login
        gamer_login = await client.post("/api/v1/auth/login", json={
            "username_or_email": "gamer@squadsync.gg",
            "password": "password123"
        })
        if gamer_login.status_code == 200:
            gamer_token = gamer_login.json()["data"]["access_token"]
            results["passed"].append("Auth: User Login (200)")
            print("  [PASS] ProGamer login successful")
        else:
            print("  [FAIL] ProGamer login failed:", gamer_login.text)
            results["failed"].append("Auth: ProGamer login")
            return

        # 1.3 Token Refresh
        ref_res = await client.post("/api/v1/auth/refresh", json={"refresh_token": refresh_token})
        if ref_res.status_code == 200 and "access_token" in ref_res.json()["data"]:
            results["passed"].append("Auth: Token Refresh (200)")
            print("  [PASS] Token refresh successful")
        else:
            results["failed"].append("Auth: Token Refresh")
            print("  [FAIL] Token refresh failed:", ref_res.text)

        # 1.4 Get Me
        headers_gamer = {"Authorization": f"Bearer {gamer_token}"}
        headers_admin = {"Authorization": f"Bearer {admin_token}"}
        me_res = await client.get("/api/v1/auth/me", headers=headers_gamer)
        if me_res.status_code == 200:
            gamer_id = me_res.json()["data"]["id"]
            results["passed"].append("Auth: Get /auth/me (200)")
            print("  [PASS] Current user info retrieved")
        else:
            results["failed"].append("Auth: Get /auth/me")
            print("  [FAIL] Get me failed:", me_res.text)

        # 1.5 Register new temporary user
        temp_username = f"testuser_{uuid.uuid4().hex[:6]}"
        reg_res = await client.post("/api/v1/auth/register", json={
            "username": temp_username,
            "email": f"{temp_username}@squadsync.gg",
            "password": "Password123!"
        })
        if reg_res.status_code == 201:
            temp_user_id = reg_res.json()["data"]["id"]
            results["passed"].append("Auth: Register New User (201)")
            print("  [PASS] New user registration successful")
        else:
            results["failed"].append(f"Auth: Register New User ({reg_res.status_code})")
            print("  [FAIL] Registration failed:", reg_res.text)

        # 1.6 Failed login attempt & brute force tracking
        fail_res = await client.post("/api/v1/auth/login", json={
            "username_or_email": temp_username,
            "password": "WrongPassword!"
        })
        if fail_res.status_code == 401 and ("remaining" in str(fail_res.json()) or "remaining" in fail_res.text):
            results["passed"].append("Auth: Failed login counter & lockout message (401)")
            print("  [PASS] Failed login properly counted down lockout attempts")
        else:
            results["failed"].append("Auth: Failed login counter")
            print("  [FAIL] Failed login response:", fail_res.text)

        # -------------------------------------------------------------
        # 2. GAMER PROFILE & AVATAR
        # -------------------------------------------------------------
        print("\n--- 2. Testing Gamer Profile ---")
        prof_me = await client.get("/api/v1/profile/me", headers=headers_gamer)
        if prof_me.status_code == 200:
            results["passed"].append("Profile: Get /profile/me (200)")
            print("  [PASS] Gamer profile retrieved")
        else:
            results["failed"].append("Profile: Get /profile/me")
            print("  [FAIL] Gamer profile failed:", prof_me.text)

        prof_update = await client.put("/api/v1/profile/me", headers=headers_gamer, json={
            "display_name": "Mercer_Updated",
            "bio": "Testing live updates",
            "preferred_roles": ["Initiator", "Duelist"]
        })
        if prof_update.status_code == 200:
            results["passed"].append("Profile: Update /profile/me (200)")
            print("  [PASS] Gamer profile updated successfully")
        else:
            results["failed"].append("Profile: Update /profile/me")
            print("  [FAIL] Gamer profile update failed:", prof_update.text)

        # -------------------------------------------------------------
        # 3. GAMER DNA™ & SURVEY
        # -------------------------------------------------------------
        print("\n--- 3. Testing Gamer DNA™ ---")
        dna_card = await client.get("/api/v1/dna/me", headers=headers_gamer)
        if dna_card.status_code == 200:
            results["passed"].append("DNA: Get /dna/me Card (200)")
            print("  [PASS] Gamer DNA card retrieved successfully")
        else:
            results["failed"].append("DNA: Get /dna/me Card")
            print("  [FAIL] Gamer DNA card retrieval failed:", dna_card.text)

        dna_gen = await client.post("/api/v1/dna/generate", headers=headers_gamer, json={
            "leadership": 85,
            "aggression": 70,
            "communication": 90,
            "game_sense": 88,
            "preferred_role": "Initiator"
        })
        if dna_gen.status_code == 200:
            results["passed"].append("DNA: Submit quiz /dna/generate (200)")
            print("  [PASS] Gamer DNA quiz submission successful")
        else:
            results["failed"].append("DNA: Submit quiz /dna/generate")
            print("  [FAIL] Gamer DNA quiz failed:", dna_gen.text)

        # -------------------------------------------------------------
        # 4. MATCHMAKING & CANDIDATE DRAFT
        # -------------------------------------------------------------
        print("\n--- 4. Testing Matchmaking & AI Draft ---")
        cand_res = await client.get("/api/v1/matchmaking/candidates?game_name=Valorant&limit=20", headers=headers_gamer)
        if cand_res.status_code == 200:
            cands = cand_res.json()["data"]
            results["passed"].append(f"Matchmaking: Get real candidates (200, {len(cands)} players)")
            print(f"  [PASS] Matchmaking candidates retrieved ({len(cands)} verified players)")
            other_user_id = cands[0]["id"] if cands else None
        else:
            results["failed"].append("Matchmaking: Get candidates")
            print("  [FAIL] Matchmaking candidates failed:", cand_res.text)
            other_user_id = None

        if other_user_id:
            compat_res = await client.post("/api/v1/matchmaking/compatibility", headers=headers_gamer, json={
                "target_user_id": other_user_id
            })
            if compat_res.status_code == 200:
                results["passed"].append("Matchmaking: Pairwise compatibility (200)")
                print("  [PASS] Pairwise compatibility calculated")
            else:
                results["failed"].append("Matchmaking: Pairwise compatibility")
                print("  [FAIL] Compatibility failed:", compat_res.text)

        eval_team = await client.post("/api/v1/matchmaking/evaluate-team", headers=headers_gamer, json={
            "roles": ["Initiator", "Duelist", "Controller"],
            "game_name": "VALORANT"
        })
        if eval_team.status_code == 200:
            results["passed"].append("Matchmaking: Evaluate team composition (200)")
            print("  [PASS] Team composition evaluation successful")
        else:
            results["failed"].append("Matchmaking: Evaluate team composition")
            print("  [FAIL] Evaluate team failed:", eval_team.text)

        # -------------------------------------------------------------
        # 5. FRIENDS & SOCIAL NETWORK
        # -------------------------------------------------------------
        print("\n--- 5. Testing Friends & Social ---")
        search_res = await client.get("/api/v1/friends/search?q=Admin", headers=headers_gamer)
        if search_res.status_code == 200:
            results["passed"].append(f"Friends: Search players (200, {len(search_res.json()['data'])} found)")
            print(f"  [PASS] Search players found {len(search_res.json()['data'])} matches")
        else:
            results["failed"].append("Friends: Search players")
            print("  [FAIL] Search players failed:", search_res.text)

        friends_list = await client.get("/api/v1/friends", headers=headers_gamer)
        if friends_list.status_code == 200:
            results["passed"].append(f"Friends: Confirmed list (200, {len(friends_list.json()['data'])} friends)")
            print(f"  [PASS] Friends list retrieved ({len(friends_list.json()['data'])} friends)")
        else:
            results["failed"].append("Friends: Confirmed list")
            print("  [FAIL] Friends list failed:", friends_list.text)

        requests_list = await client.get("/api/v1/friends/requests", headers=headers_gamer)
        if requests_list.status_code == 200:
            results["passed"].append(f"Friends: Pending requests (200, {len(requests_list.json()['data'])} pending)")
            print(f"  [PASS] Pending requests retrieved ({len(requests_list.json()['data'])} pending)")
        else:
            results["failed"].append("Friends: Pending requests")
            print("  [FAIL] Pending requests failed:", requests_list.text)

        # -------------------------------------------------------------
        # 6. SQUAD & TEAM MANAGEMENT
        # -------------------------------------------------------------
        print("\n--- 6. Testing Squads & Rosters ---")
        team_create = await client.post("/api/v1/teams", headers=headers_gamer, json={
            "name": f"Squad_{uuid.uuid4().hex[:4]}",
            "game": "VALORANT",
            "description": "Automated verification squad",
            "synergy_score": 96.5,
            "member_ids": [other_user_id] if other_user_id else []
        })
        if team_create.status_code == 201:
            created_team = team_create.json()["data"]
            created_team_id = created_team["id"]
            results["passed"].append("Teams: Create squad (201)")
            print(f"  [PASS] Squad created successfully: {created_team['name']} ({created_team_id})")
        else:
            results["failed"].append("Teams: Create squad")
            print("  [FAIL] Squad creation failed:", team_create.text)
            created_team_id = None

        my_teams = await client.get("/api/v1/teams/my", headers=headers_gamer)
        if my_teams.status_code == 200:
            results["passed"].append(f"Teams: Get my squads (200, {len(my_teams.json()['data'])} squads)")
            print(f"  [PASS] My squads list retrieved ({len(my_teams.json()['data'])} squads)")
        else:
            results["failed"].append("Teams: Get my squads")
            print("  [FAIL] My squads failed:", my_teams.text)

        # -------------------------------------------------------------
        # 7. REAL-TIME CHAT & WEBSOCKETS
        # -------------------------------------------------------------
        print("\n--- 7. Testing Chat History ---")
        if other_user_id:
            chat_hist = await client.get(f"/api/v1/chat/direct/{other_user_id}", headers=headers_gamer)
            if chat_hist.status_code == 200:
                results["passed"].append("Chat: Get direct message history (200)")
                print("  [PASS] Direct message history retrieved successfully")
            else:
                results["failed"].append("Chat: Get direct message history")
                print("  [FAIL] Direct history failed:", chat_hist.text)

        if created_team_id:
            team_hist = await client.get(f"/api/v1/chat/team/{created_team_id}", headers=headers_gamer)
            if team_hist.status_code == 200:
                results["passed"].append("Chat: Get squad channel chat history (200)")
                print("  [PASS] Squad channel history retrieved successfully")
            else:
                results["failed"].append("Chat: Get squad channel chat history")
                print("  [FAIL] Squad history failed:", team_hist.text)

        # -------------------------------------------------------------
        # 8. GAMING NEWS & PORTAL
        # -------------------------------------------------------------
        print("\n--- 8. Testing Gaming News ---")
        news_res = await client.get("/api/v1/news")
        if news_res.status_code == 200:
            articles = news_res.json()["data"]
            results["passed"].append(f"News: Get gaming news feed (200, {len(articles)} articles)")
            print(f"  [PASS] News feed retrieved ({len(articles)} articles)")
        else:
            results["failed"].append("News: Get gaming news feed")
            print("  [FAIL] News feed failed:", news_res.text)

        # -------------------------------------------------------------
        # 9. ADMIN DASHBOARD & MODERATION
        # -------------------------------------------------------------
        print("\n--- 9. Testing Admin Dashboard & Moderation ---")
        analytics_res = await client.get("/api/v1/admin/analytics", headers=headers_admin)
        if analytics_res.status_code == 200:
            analytics = analytics_res.json()["data"]
            results["passed"].append("Admin: Get platform analytics KPI (200)")
            print(f"  [PASS] Admin platform analytics: {analytics}")
        else:
            results["failed"].append("Admin: Get platform analytics KPI")
            print("  [FAIL] Admin analytics failed:", analytics_res.text)

        # Non-admin user trying to access admin endpoint
        unauth_admin = await client.get("/api/v1/admin/analytics", headers=headers_gamer)
        if unauth_admin.status_code == 403:
            results["passed"].append("Security Check: RBAC Non-Admin Blocked on /admin/analytics (403)")
            print("  [PASS] Non-admin properly blocked from admin analytics with 403 Forbidden")
        else:
            results["failed"].append("Security Check: RBAC Non-Admin Blocked on /admin/analytics")
            print("  [FAIL] RBAC check failed:", unauth_admin.text)

        admin_users = await client.get("/api/v1/admin/users", headers=headers_admin)
        if admin_users.status_code == 200:
            results["passed"].append(f"Admin: List users (200, {len(admin_users.json()['data'])} users)")
            print(f"  [PASS] Admin user oversight list retrieved ({len(admin_users.json()['data'])} users)")
        else:
            results["failed"].append("Admin: List users")
            print("  [FAIL] Admin user list failed:", admin_users.text)

        reports_res = await client.get("/api/v1/admin/reports", headers=headers_admin)
        if reports_res.status_code == 200:
            results["passed"].append(f"Admin: List moderation reports (200, {len(reports_res.json()['data'])} reports)")
            print(f"  [PASS] Admin reports retrieved ({len(reports_res.json()['data'])} reports)")
        else:
            results["failed"].append("Admin: List moderation reports")
            print("  [FAIL] Admin reports failed:", reports_res.text)

        # -------------------------------------------------------------
        # 10. GAME INTEGRATIONS (STEAM & RIOT)
        # -------------------------------------------------------------
        print("\n--- 10. Testing Game Integrations ---")
        steam_res = await client.get("/api/v1/games/steam/login")
        if steam_res.status_code == 200 and "steamcommunity.com" in steam_res.json()["data"]["login_url"]:
            results["passed"].append("Games: Steam OpenID URL generation (200)")
            print("  [PASS] Steam OpenID URL generated successfully")
        else:
            results["failed"].append("Games: Steam OpenID URL")
            print("  [FAIL] Steam login URL failed:", steam_res.text)

        riot_res = await client.get("/api/v1/games/riot/login")
        if riot_res.status_code == 200 and "auth_url" in riot_res.json()["data"]:
            results["passed"].append("Games: Riot RSO OAuth URL generation (200)")
            print("  [PASS] Riot RSO login URL generated successfully")
        else:
            results["failed"].append("Games: Riot RSO OAuth URL")
            print("  [FAIL] Riot login URL failed:", riot_res.text)

        print("\n" + "=" * 60)
        print("TEST SUITE SUMMARY:")
        print(f"Total Passed: {len(results['passed'])}")
        print(f"Total Failed: {len(results['failed'])}")
        print("=" * 60)


if __name__ == "__main__":
    asyncio.run(run_suite())
