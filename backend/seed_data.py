"""
SquadSync Comprehensive Database Seeder
Seeds complete, rich, production-grade test data tailored directly to all frontend screens:
- Admin & Member User accounts
- Gamer Profiles & Game Accounts (Valorant, CS2, Dota 2, Apex Legends)
- Gamer DNA psychometrics & tactical roles
- Candidate Pool for AI Draft & Matchmaking
- Friendships & Pending Friend Requests
- Competitive Squads & Roster Members
- Esports News, Patch Notes & Announcements
- Moderation Reports & SLA tracking for Admin Dashboard
- Direct and Squad Chat Messages
"""

import asyncio
from datetime import datetime, timedelta, timezone
import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import AsyncSessionLocal, engine
from app.core.security import get_password_hash
from app.models import (
    Base,
    ChatMessage,
    Friendship,
    FriendshipStatus,
    GameAccount,
    GamerDNA,
    GamerProfile,
    NewsArticle,
    PlayerStat,
    ReportStatus,
    Team,
    TeamMember,
    User,
    UserReport,
)

NOW = datetime.now(timezone.utc)
PASSWORD_HASH = get_password_hash("password123")


async def seed():
    print("[*] Verifying database schema...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as session:
        # Check if core users already seeded
        res = await session.execute(select(User))
        existing_users_list = res.scalars().all()
        existing_by_uname = {u.username.lower(): u for u in existing_users_list}
        existing_by_email = {u.email.lower(): u for u in existing_users_list}

        needed_core = {"adminmaster", "progamer", "shadow", "nova", "phoenixcarry"}
        if needed_core.issubset(existing_by_uname.keys()):
            print(f"[!] Database already populated with core accounts ({len(existing_users_list)} users).")
            return

        print("[*] Seeding Users and Gamer Profiles...")

        users_data = [
            # 1. Admin account
            {
                "id": uuid.UUID("11111111-1111-1111-1111-111111111111"),
                "username": "AdminMaster",
                "email": "admin@squadsync.gg",
                "is_admin": True,
                "profile": {
                    "full_name": "System Administrator",
                    "bio": "SquadSync Lead Ops & Competitive Matchmaking Overseer.",
                    "primary_game": "VALORANT",
                    "region": "NA-East",
                    "primary_language": "en",
                    "mic_enabled": True,
                    "competitive_intent": "HARDCORE",
                    "gamer_tag": "Admin#SYNC",
                },
                "dna": {
                    "leadership": 95,
                    "communication": 95,
                    "strategy": 92,
                    "teamwork": 90,
                    "aggression": 65,
                    "confidence": 90,
                    "primary_role": "Leader",
                    "secondary_role": "Strategist",
                    "personality": "The Grandmaster Shotcaller",
                    "reasoning": "Decisive macro caller prioritizing squad objective control and economy management.",
                },
                "stats": [
                    {"game": "VALORANT", "rank": "Radiant", "mmr": 2400, "win_rate": 66.5, "kd_ratio": 1.45, "matches": 650},
                ],
            },
            # 2. Main demo gamer
            {
                "id": uuid.UUID("22222222-2222-2222-2222-222222222222"),
                "username": "ProGamer",
                "email": "gamer@squadsync.gg",
                "is_admin": False,
                "profile": {
                    "full_name": "Alex Mercer",
                    "bio": "Competitive flex fragger looking for coordinated 5-stack ranked climb.",
                    "primary_game": "VALORANT",
                    "region": "NA-East",
                    "primary_language": "en",
                    "mic_enabled": True,
                    "competitive_intent": "COMPETITIVE",
                    "gamer_tag": "Mercer#777",
                },
                "dna": {
                    "leadership": 82,
                    "communication": 90,
                    "strategy": 88,
                    "teamwork": 85,
                    "aggression": 78,
                    "confidence": 85,
                    "primary_role": "Initiator",
                    "secondary_role": "Duelist",
                    "personality": "The Tactical Vanguard",
                    "reasoning": "High-impact recon and opening utility with seamless team callout synchronization.",
                },
                "stats": [
                    {"game": "VALORANT", "rank": "Immortal 2", "mmr": 2150, "win_rate": 58.2, "kd_ratio": 1.32, "matches": 420},
                    {"game": "CS2", "rank": "Faceit 9", "mmr": 1950, "win_rate": 56.0, "kd_ratio": 1.25, "matches": 310},
                ],
            },
            # 3. Shadow (Duelist)
            {
                "id": uuid.UUID("33333333-3333-3333-3333-333333333333"),
                "username": "Shadow",
                "email": "shadow@squadsync.gg",
                "is_admin": False,
                "profile": {
                    "full_name": "Marcus Vance",
                    "bio": "Relentless entry duelist. High first-blood conversion and opening duel win rate.",
                    "primary_game": "VALORANT",
                    "region": "NA-East",
                    "primary_language": "en",
                    "mic_enabled": True,
                    "competitive_intent": "HARDCORE",
                    "gamer_tag": "Shadow#VNC",
                },
                "dna": {
                    "leadership": 60,
                    "communication": 75,
                    "strategy": 70,
                    "teamwork": 72,
                    "aggression": 96,
                    "confidence": 95,
                    "primary_role": "Duelist",
                    "secondary_role": "Flex",
                    "personality": "The Fearless Apex Fragger",
                    "reasoning": "Calculated explosive aggression. Dominates opening duels with extreme clutch poise.",
                },
                "stats": [
                    {"game": "VALORANT", "rank": "Immortal 3", "mmr": 2280, "win_rate": 61.4, "kd_ratio": 1.58, "matches": 580},
                ],
            },
            # 4. Nova (Controller)
            {
                "id": uuid.UUID("44444444-4444-4444-4444-444444444444"),
                "username": "Nova",
                "email": "nova@squadsync.gg",
                "is_admin": False,
                "profile": {
                    "full_name": "Elena Rostova",
                    "bio": "Smoke specialist and map architect. Controls sightlines and enables clean site executes.",
                    "primary_game": "VALORANT",
                    "region": "NA-East",
                    "primary_language": "en",
                    "mic_enabled": True,
                    "competitive_intent": "COMPETITIVE",
                    "gamer_tag": "Nova#EXEC",
                },
                "dna": {
                    "leadership": 80,
                    "communication": 92,
                    "strategy": 95,
                    "teamwork": 94,
                    "aggression": 45,
                    "confidence": 80,
                    "primary_role": "Controller",
                    "secondary_role": "Support",
                    "personality": "The Spatial Architect",
                    "reasoning": "Unmatched smoke lineup precision and objective zoning. Exceptional team utility coverage.",
                },
                "stats": [
                    {"game": "VALORANT", "rank": "Immortal 1", "mmr": 2080, "win_rate": 57.5, "kd_ratio": 1.15, "matches": 490},
                ],
            },
            # 5. Ghost (Sentinel)
            {
                "id": uuid.UUID("55555555-5555-5555-5555-555555555555"),
                "username": "Ghost",
                "email": "ghost@squadsync.gg",
                "is_admin": False,
                "profile": {
                    "full_name": "Tariq Malik",
                    "bio": "Defensive anchor. Site stalls, anti-flank traps, and lockdown retakes.",
                    "primary_game": "VALORANT",
                    "region": "NA-East",
                    "primary_language": "en",
                    "mic_enabled": True,
                    "competitive_intent": "COMPETITIVE",
                    "gamer_tag": "Ghost#SITE",
                },
                "dna": {
                    "leadership": 75,
                    "communication": 82,
                    "strategy": 90,
                    "teamwork": 88,
                    "aggression": 40,
                    "confidence": 85,
                    "primary_role": "Sentinel",
                    "secondary_role": "Strategist",
                    "personality": "The Unbreakable Citadel",
                    "reasoning": "Impenetrable site defense and trap network coverage with near-zero unforced errors.",
                },
                "stats": [
                    {"game": "VALORANT", "rank": "Ascendant 3", "mmr": 1950, "win_rate": 55.8, "kd_ratio": 1.18, "matches": 380},
                ],
            },
            # 6. Echo (Initiator)
            {
                "id": uuid.UUID("66666666-6666-6666-6666-666666666666"),
                "username": "Echo",
                "email": "echo@squadsync.gg",
                "is_admin": False,
                "profile": {
                    "full_name": "Liam Byrne",
                    "bio": "Info gatherer & flash initiator. Clear callouts and team trade setups.",
                    "primary_game": "VALORANT",
                    "region": "NA-East",
                    "primary_language": "en",
                    "mic_enabled": True,
                    "competitive_intent": "COMPETITIVE",
                    "gamer_tag": "Echo#RECON",
                },
                "dna": {
                    "leadership": 85,
                    "communication": 96,
                    "strategy": 88,
                    "teamwork": 92,
                    "aggression": 68,
                    "confidence": 88,
                    "primary_role": "Initiator",
                    "secondary_role": "Leader",
                    "personality": "The Radar Synchronizer",
                    "reasoning": "Provides nonstop actionable telemetry and coordinated crowd control flash assists.",
                },
                "stats": [
                    {"game": "VALORANT", "rank": "Ascendant 2", "mmr": 1890, "win_rate": 54.5, "kd_ratio": 1.22, "matches": 340},
                ],
            },
            # 7. Venom (Duelist / Flanker)
            {
                "id": uuid.UUID("77777777-7777-7777-7777-777777777777"),
                "username": "Venom",
                "email": "venom@squadsync.gg",
                "is_admin": False,
                "profile": {
                    "full_name": "Klaus Schmidt",
                    "bio": "Silent lurker and space creator. Disrupts enemy rotators from behind lines.",
                    "primary_game": "CS2",
                    "region": "EU-West",
                    "primary_language": "en",
                    "mic_enabled": True,
                    "competitive_intent": "HARDCORE",
                    "gamer_tag": "Venom#CS",
                },
                "dna": {
                    "leadership": 55,
                    "communication": 70,
                    "strategy": 85,
                    "teamwork": 65,
                    "aggression": 90,
                    "confidence": 92,
                    "primary_role": "Duelist",
                    "secondary_role": "Lurker",
                    "personality": "The Unseen Predator",
                    "reasoning": "Excels in deceptive map presence, solo timings, and isolating 1v1 multi-kills.",
                },
                "stats": [
                    {"game": "CS2", "rank": "Global Elite", "mmr": 2350, "win_rate": 60.1, "kd_ratio": 1.42, "matches": 720},
                ],
            },
            # 8. Valkyrie (Initiator / IGL)
            {
                "id": uuid.UUID("88888888-8888-8888-8888-888888888888"),
                "username": "Valkyrie",
                "email": "valkyrie@squadsync.gg",
                "is_admin": False,
                "profile": {
                    "full_name": "Sariha Chen",
                    "bio": "Tournament seasoned in-game leader. Calms squads in overtime and makes clutch pivots.",
                    "primary_game": "VALORANT",
                    "region": "NA-East",
                    "primary_language": "en",
                    "mic_enabled": True,
                    "competitive_intent": "HARDCORE",
                    "gamer_tag": "Valkyrie#IGL",
                },
                "dna": {
                    "leadership": 98,
                    "communication": 96,
                    "strategy": 94,
                    "teamwork": 92,
                    "aggression": 65,
                    "confidence": 94,
                    "primary_role": "Initiator",
                    "secondary_role": "Leader",
                    "personality": "The Apex General",
                    "reasoning": "Elite competitive macro strategist with peerless mid-round adaptation and vocal poise.",
                },
                "stats": [
                    {"game": "VALORANT", "rank": "Radiant", "mmr": 2450, "win_rate": 64.8, "kd_ratio": 1.38, "matches": 890},
                ],
            },
            # 9. Aegis (Dota 2 Support)
            {
                "id": uuid.UUID("99999999-9999-9999-9999-999999999999"),
                "username": "Aegis",
                "email": "aegis@squadsync.gg",
                "is_admin": False,
                "profile": {
                    "full_name": "Dmitri Volkov",
                    "bio": "Position 5 Hard Support. Vision dominance, smoke ganks, and teamfight saves.",
                    "primary_game": "Dota 2",
                    "region": "EU-West",
                    "primary_language": "en",
                    "mic_enabled": True,
                    "competitive_intent": "HARDCORE",
                    "gamer_tag": "Aegis#POS5",
                },
                "dna": {
                    "leadership": 88,
                    "communication": 92,
                    "strategy": 96,
                    "teamwork": 98,
                    "aggression": 40,
                    "confidence": 85,
                    "primary_role": "Support",
                    "secondary_role": "Strategist",
                    "personality": "The Ward Sovereign",
                    "reasoning": "Total vision mastery, selfless economy deployment, and game-saving defensive utility.",
                },
                "stats": [
                    {"game": "Dota 2", "rank": "Immortal", "mmr": 6200, "win_rate": 59.4, "kd_ratio": 0.95, "matches": 1400},
                ],
            },
            # 10. PhoenixCarry (VALORANT Duelist / Entry)
            {
                "id": uuid.UUID("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"),
                "username": "PhoenixCarry",
                "email": "phoenix@squadsync.gg",
                "is_admin": False,
                "profile": {
                    "full_name": "Marcus Vance",
                    "bio": "Solo queue survivor turned squad captain. Phoenix & Reyna entry specialist.",
                    "primary_game": "VALORANT",
                    "region": "NA-East",
                    "primary_language": "en",
                    "mic_enabled": True,
                    "competitive_intent": "COMPETITIVE",
                    "gamer_tag": "Phoenix#CARRY",
                },
                "dna": {
                    "leadership": 82,
                    "communication": 88,
                    "strategy": 84,
                    "teamwork": 86,
                    "aggression": 94,
                    "confidence": 92,
                    "primary_role": "Duelist",
                    "secondary_role": "Entry",
                    "personality": "The Blazing Entry Fragger",
                    "reasoning": "Unflinching entry aggression, high opening duel winrate, and decisive site breakthroughs.",
                },
                "stats": [
                    {"game": "VALORANT", "rank": "Immortal 2", "mmr": 2180, "win_rate": 60.2, "kd_ratio": 1.42, "matches": 420},
                ],
            },
        ]

        created_users: dict[str, User] = {}

        for ud in users_data:
            uname_lower = ud["username"].lower()
            email_lower = ud["email"].lower()

            if uname_lower in existing_by_uname:
                created_users[ud["username"]] = existing_by_uname[uname_lower]
                continue
            if email_lower in existing_by_email:
                created_users[ud["username"]] = existing_by_email[email_lower]
                continue

            user = User(
                id=ud["id"],
                username=ud["username"],
                email=ud["email"],
                password_hash=PASSWORD_HASH,
                is_active=True,
                is_admin=ud["is_admin"],
                created_at=NOW - timedelta(days=30),
                updated_at=NOW,
            )
            session.add(user)
            created_users[ud["username"]] = user
            existing_by_uname[uname_lower] = user
            existing_by_email[email_lower] = user

            # Profile
            p = ud["profile"]
            prof = GamerProfile(
                id=uuid.uuid4(),
                user_id=user.id,
                full_name=p["full_name"],
                display_name=p["gamer_tag"],
                bio=p["bio"],
                favorite_game=p["primary_game"],
                preferred_games=[p["primary_game"]],
                preferred_roles=[ud["dna"]["primary_role"]],
                region=p["region"],
                language=p["primary_language"],
                avatar_url=f"https://api.dicebear.com/7.x/bottts/svg?seed={user.username}",
                preferences={
                    "mic_enabled": p["mic_enabled"],
                    "competitive_intent": p["competitive_intent"],
                },
                created_at=NOW - timedelta(days=30),
                updated_at=NOW,
            )
            session.add(prof)

            # DNA
            d = ud["dna"]
            dna = GamerDNA(
                id=uuid.uuid4(),
                user_id=user.id,
                leadership=d["leadership"],
                communication=d["communication"],
                strategy=d["strategy"],
                teamwork=d["teamwork"],
                aggression=d["aggression"],
                confidence=d["confidence"],
                primary_role=d["primary_role"],
                secondary_role=d["secondary_role"],
                personality=d["personality"],
                reasoning=d["reasoning"],
                created_at=NOW - timedelta(days=25),
                updated_at=NOW,
            )
            session.add(dna)

            # Game Accounts & Stats
            for st in ud.get("stats", []):
                acc = GameAccount(
                    id=uuid.uuid4(),
                    user_id=user.id,
                    game_name=st["game"],
                    platform=st["game"].lower(),
                    account_identifier=f"{user.username.lower()}_{st['game'].lower()}",
                    in_game_name=p["gamer_tag"],
                    is_verified=True,
                    last_synced_at=NOW - timedelta(days=20),
                    created_at=NOW - timedelta(days=20),
                )
                session.add(acc)

                stat = PlayerStat(
                    id=uuid.uuid4(),
                    user_id=user.id,
                    game_account_id=acc.id,
                    season="Episode 8: Act 3",
                    game_mode="competitive",
                    current_rank=st["rank"],
                    rank_rating=st["mmr"],
                    win_rate=st["win_rate"],
                    kd_ratio=st["kd_ratio"],
                    matches_played=st["matches"],
                    wins=int(st["matches"] * (st["win_rate"] / 100)),
                    losses=int(st["matches"] * (1 - st["win_rate"] / 100)),
                    kda=round(st["kd_ratio"] * 1.25, 2),
                    created_at=NOW - timedelta(days=20),
                    updated_at=NOW,
                )
                session.add(stat)

        await session.flush()
        print(f"[+] Verified/created {len(created_users)} users with profiles, DNA, and official stats.")

        # Seed Friendships
        print("[*] Seeding Friendships & Social Connections...")
        progamer = created_users.get("ProGamer")
        admin_u = created_users.get("AdminMaster")

        if progamer and admin_u:
            # Accepted friends for ProGamer
            friends_to_accept = ["Nova", "Ghost", "Echo", "AdminMaster", "PhoenixCarry"]
            for fname in friends_to_accept:
                if fname not in created_users:
                    continue
                other = created_users[fname]
                f_check = await session.execute(
                    select(Friendship).where(
                        (Friendship.requester_id == progamer.id) & (Friendship.addressee_id == other.id)
                    )
                )
                if not f_check.scalar_one_or_none():
                    f = Friendship(
                        id=uuid.uuid4(),
                        requester_id=progamer.id,
                        addressee_id=other.id,
                        status=FriendshipStatus.ACCEPTED.value,
                        created_at=NOW - timedelta(days=10),
                        updated_at=NOW - timedelta(days=8),
                    )
                    session.add(f)

            # Pending incoming friend requests for ProGamer
            pending_incoming = ["Venom", "Valkyrie"]
            for pname in pending_incoming:
                if pname not in created_users:
                    continue
                other = created_users[pname]
                f_check = await session.execute(
                    select(Friendship).where(
                        (Friendship.requester_id == other.id) & (Friendship.addressee_id == progamer.id)
                    )
                )
                if not f_check.scalar_one_or_none():
                    f = Friendship(
                        id=uuid.uuid4(),
                        requester_id=other.id,
                        addressee_id=progamer.id,
                        status=FriendshipStatus.PENDING.value,
                        created_at=NOW - timedelta(hours=6),
                    )
                    session.add(f)

            await session.flush()
            print("[+] Verified friendships and pending social requests.")

        # Seed Teams & Squads
        print("[*] Seeding Competitive Squads...")
        # Seed Teams & Squads
        print("[*] Seeding Competitive Squads...")
        # Team 1: Radiant Strike Force
        t1_check = await session.execute(select(Team).where(Team.name == "Radiant Strike Force"))
        if not t1_check.scalar_one_or_none() and admin_u:
            team1 = Team(
                id=uuid.uuid4(),
                name="Radiant Strike Force",
                game="VALORANT",
                owner_id=admin_u.id,
                description="Tier-1 scrim squad training for Champions qualifiers. Strict comms and set plays.",
                synergy_score=94.5,
                max_members=5,
                created_at=NOW - timedelta(days=14),
            )
            session.add(team1)

            team1_roster = [
                (admin_u, "Leader"),
                (created_users["Shadow"], "Duelist"),
                (created_users["Nova"], "Controller"),
                (created_users["Ghost"], "Sentinel"),
                (created_users["Echo"], "Initiator"),
            ]
            for member, role in team1_roster:
                tm = TeamMember(
                    id=uuid.uuid4(),
                    team_id=team1.id,
                    user_id=member.id,
                    role=role,
                    created_at=NOW - timedelta(days=14),
                )
                session.add(tm)

        # Team 2: Aegis Syndicate
        t2_check = await session.execute(select(Team).where(Team.name == "Aegis Syndicate"))
        if not t2_check.scalar_one_or_none() and progamer and "Aegis" in created_users:
            team2 = Team(
                id=uuid.uuid4(),
                name="Aegis Syndicate",
                game="Dota 2",
                owner_id=progamer.id,
                description="Immortal-bracket battle cup stack. Heavy vision control and timing pushes.",
                synergy_score=91.0,
                max_members=5,
                created_at=NOW - timedelta(days=7),
            )
            session.add(team2)

            team2_roster = [
                (progamer, "Core"),
                (created_users["Aegis"], "Hard Support"),
            ]
            for member, role in team2_roster:
                tm = TeamMember(
                    id=uuid.uuid4(),
                    team_id=team2.id,
                    user_id=member.id,
                    role=role,
                    created_at=NOW - timedelta(days=7),
                )
                session.add(tm)

        await session.flush()
        print("[+] Verified competitive teams with rosters.")

        # Seed Esports News Articles
        print("[*] Seeding Esports News & Announcements...")
        existing_news_res = await session.execute(select(NewsArticle.source_url))
        existing_urls = {r[0] for r in existing_news_res.fetchall() if r[0]}

        articles_data = [
            {
                "title": "VALORANT Champions Tour 2026: Masters Madrid Roster Shakeup",
                "summary": "Key roster acquisitions and role reallocations across Sentinels, Fnatic, and Paper Rex ahead of the international showdown.",
                "content": "Teams have begun locking in their starting rosters for Masters Madrid. Analysis reveals heavy shifts toward flexible Initiator-Duelist hybrids as tactical utility meta shifts dramatically.",
                "game": "VALORANT",
                "category": "Esports",
                "image_url": "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80",
                "source_url": "https://vct.gg/news/masters-madrid-rosters",
                "published_at": NOW - timedelta(hours=4),
            },
            {
                "title": "Counter-Strike 2 Update: Sub-Tick Precision & Mirage Rework",
                "summary": "Valve deploys major update addressing hit registration consistency, grenade throw mechanics, and site line revisions on de_mirage.",
                "content": "The latest patch brings sub-tick animation responsiveness down to zero perceptible latency, vastly improving crosshair feedback for snipers and riflers alike in competitive matchmaking.",
                "game": "CS2",
                "category": "Patch Notes",
                "image_url": "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=800&q=80",
                "source_url": "https://store.steampowered.com/news/app/730",
                "published_at": NOW - timedelta(hours=18),
            },
            {
                "title": "Dota 2 Patch 7.40: Tormentor Scaling & Support Economy Buffs",
                "summary": "IceFrog rebalances early-game warding gold, modifies Roshan pit timings, and strengthens position 4/5 playstyles.",
                "content": "Support heroes receive improved gold bounties on dewarding and stack assists, dramatically boosting tactical cohesion in high-rank matchmaking queues.",
                "game": "Dota 2",
                "category": "Patch Notes",
                "image_url": "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=800&q=80",
                "source_url": "https://www.dota2.com/patches/7.40",
                "published_at": NOW - timedelta(days=1),
            },
            {
                "title": "SquadSync AI v2.0: Deep Reinforcement Learning for Squad Chemistry",
                "summary": "SquadSync rolls out neural synergy evaluation, reducing solo-queue toxicity by 82% and pairing players on playstyle personality.",
                "content": "Our updated engine models 6 distinct psychometric dimensions alongside real-time game telemetry from Steam and Riot APIs, ensuring every match feels coordinated from round one.",
                "game": "VALORANT",
                "category": "Announcements",
                "image_url": "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80",
                "source_url": "https://squadsync.gg/blog/ai-v2",
                "published_at": NOW - timedelta(days=2),
            },
            {
                "title": "VCT Pacific: Gen.G Dominates Group Stage with Flawless 10-0 Sweep",
                "summary": "Dominant utility combos and hyper-aggressive site retakes cement Gen.G as the team to beat heading into the Pacific finals.",
                "content": "Led by surgical flash setups, Gen.G dropped zero maps across five series, proving that coordinated role distribution outplays pure individual aim every time.",
                "game": "VALORANT",
                "category": "Esports",
                "image_url": "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=800&q=80",
                "source_url": "https://vct.gg/news/pacific-geng-streak",
                "published_at": NOW - timedelta(days=3),
            },
            {
                "title": "The Art of the IGL: Why Strategic Leadership Wins Tier-1 Tournaments",
                "summary": "Deep dive into the psychological profiles and communication traits that separate great in-game leaders from rank-and-file fraggers.",
                "content": "Interviews with leading esports coaches demonstrate that clear information filtering, rapid mid-round pivot calls, and mental reset discipline determine 90% of clutch round outcomes.",
                "game": "CS2",
                "category": "Announcements",
                "image_url": "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80",
                "source_url": "https://squadsync.gg/blog/igl-mastery",
                "published_at": NOW - timedelta(days=4),
            },
        ]

        for art in articles_data:
            if art["source_url"] in existing_urls:
                continue
            session.add(
                NewsArticle(
                    id=uuid.uuid4(),
                    title=art["title"],
                    summary=art["summary"],
                    content=art["content"],
                    game=art["game"],
                    category=art["category"],
                    image_url=art["image_url"],
                    source_url=art["source_url"],
                    published_at=art["published_at"],
                    created_at=art["published_at"],
                )
            )
            existing_urls.add(art["source_url"])

        await session.flush()
        print(f"[+] Created {len(articles_data)} esports news articles.")

        # Seed Moderation Reports
        print("[*] Seeding Admin Moderation Reports...")
        reports_data = [
            {
                "reporter": created_users["Echo"],
                "reported": created_users["Venom"],
                "reason": "Toxic Voice Comms & Yelling",
                "details": "Player yelled obscenities continuously during Haven round 12 overtime and disrupted callouts.",
                "status": ReportStatus.PENDING.value,
                "created_at": NOW - timedelta(hours=3),
            },
            {
                "reporter": created_users["Ghost"],
                "reported": created_users["Shadow"],
                "reason": "Suspected Smurfing / Account Boost",
                "details": "Player boasts 98% headshot rate in Ascendant lobby with brand new account.",
                "status": ReportStatus.PENDING.value,
                "created_at": NOW - timedelta(hours=14),
            },
            {
                "reporter": created_users["Nova"],
                "reported": created_users["Venom"],
                "reason": "Intentional Throwing & AFK",
                "details": "Left the match after losing pistol round, forcing squad into 4v5 deficit.",
                "status": ReportStatus.RESOLVED.value,
                "created_at": NOW - timedelta(days=3),
            },
        ]

        for rep in reports_data:
            session.add(
                UserReport(
                    id=uuid.uuid4(),
                    reporter_id=rep["reporter"].id,
                    reported_user_id=rep["reported"].id,
                    reason=rep["reason"],
                    details=rep["details"],
                    status=rep["status"],
                    created_at=rep["created_at"],
                )
            )

        # Seed Sample Chat Messages
        print("[*] Seeding Sample Chat Messages...")
        messages = [
            (progamer.id, created_users["Nova"].id, "Hey Nova, ready for the evening ranked queue?", NOW - timedelta(minutes=45)),
            (created_users["Nova"].id, progamer.id, "Always ready! Have smoke lineups locked for Sunset and Haven.", NOW - timedelta(minutes=30)),
            (progamer.id, created_users["Nova"].id, "Awesome, grabbing Echo and Ghost now.", NOW - timedelta(minutes=10)),
        ]
        for sender_id, recipient_id, content, sent_at in messages:
            session.add(
                ChatMessage(
                    id=uuid.uuid4(),
                    sender_id=sender_id,
                    recipient_id=recipient_id,
                    content=content,
                    created_at=sent_at,
                )
            )

        await session.commit()
        print("\n[SUCCESS] SquadSync database successfully seeded with all frontend models and records!")


if __name__ == "__main__":
    asyncio.run(seed())
