# Proto Tools Quick Reference

## 🎯 Most Common Commands

```bash
# Launch Buf Studio for API testing
make studio

# View proto statistics
make proto-status

# Generate proto code
make generate

# Watch proto files and auto-regenerate
make proto-watch

# Lint proto files
make proto-lint

# Format proto files
make proto-format
```

---

## 📊 Current API Statistics

- **Services**: 3
  - AuthService (26 RPCs)
  - UserService (13 RPCs)
  - UserService (example - 1 RPC)

- **Messages**: 126
- **Enums**: 27
- **RPC Methods**: 43
- **Proto Files**: 5

---

## 🚀 Buf Studio Commands

| Command | Description |
|---------|-------------|
| `make studio` | Open Buf Studio web interface |
| `make studio-local` | Run Buf Studio locally (requires buf CLI) |

**Buf Studio URL**: https://studio.buf.build

**Load Schema Steps**:
1. Click "Load Schema"
2. Select "From Local Files"
3. Navigate to `proto/` directory

---

## 🔧 Proto Development

| Command | Description |
|---------|-------------|
| `make generate` | Generate Go & TypeScript code from proto |
| `make proto-watch` | Auto-regenerate on proto file changes |
| `make proto-lint` | Validate proto files |
| `make proto-format` | Auto-format proto files |
| `make proto-breaking` | Check for breaking API changes |
| `make proto-docs` | Generate HTML documentation |
| `make proto-status` | Show proto statistics |

---

## 🧪 gRPC Testing (When Implemented)

| Command | Description |
|---------|-------------|
| `make grpcurl-list` | List available gRPC services |
| `make grpcurl-health` | Check gRPC health |
| `make grpcurl-auth` | Example auth service call |

**Manual grpcurl Example**:
```bash
grpcurl -plaintext \
  -d '{"credentials": {"email": "user@example.com", "password": "pass123"}}' \
  localhost:9090 \
  datifyy.auth.v1.AuthService/LoginWithEmail
```

---

## 📁 Proto File Structure

```
proto/
├── buf.yaml              # Buf configuration
├── buf.gen.yaml          # Code generation config
├── buf.studio.yaml       # Buf Studio config
├── common/v1/
│   └── types.proto       # Common types (Timestamp, Error, Pagination)
├── auth/v1/
│   ├── messages.proto    # Auth message types
│   └── auth.proto        # AuthService definition
└── user/v1/
    └── user.proto        # UserService definition
```

---

## 🎨 Key Enums & Types

### Common Types
- `AccountStatus` - Active, Pending, Suspended, Banned, Deleted
- `VerificationStatus` - Unverified, Pending, Verified, Expired
- `DevicePlatform` - Web, iOS, Android, Desktop

### User Profile Enums
- `Gender` (8 options)
- `ZodiacSign` (12 signs)
- `OccupationCategory` (48 worldwide + India)
- `EducationLevel` (11 levels)
- `InterestCategory` (20 interests)
- `LanguageCode` (32 languages)
- `RelationshipGoal` (7 options)
- `DrinkingHabit`, `SmokingHabit`, `WorkoutFrequency`
- `DietaryPreference` (11 options including Jain, Halal, Kosher)
- `Religion` (13 options)
- `PetPreference`, `ChildrenPreference`
- `CommunicationStyle`, `LoveLanguage`, `SleepSchedule`
- `PromptQuestion` (20 dating prompts)

---

## ⚡ Development Workflow

### 1. Making Proto Changes
```bash
# 1. Edit proto file
vim proto/user/v1/user.proto

# 2. Format
make proto-format

# 3. Validate
make proto-lint

# 4. Check breaking changes
make proto-breaking

# 5. Regenerate code
make generate

# 6. Test in Buf Studio
make studio
```

### 2. Adding New Service
```bash
# 1. Create proto file
mkdir -p proto/matching/v1
vim proto/matching/v1/matching.proto

# 2. Define service
# service MatchingService { ... }

# 3. Generate code
make generate

# 4. Implement in backend
# Implement gRPC service handlers

# 5. Test
make studio
```

---

## 🔍 Troubleshooting

### Proto lint errors
```bash
# View detailed errors
make proto-lint

# Auto-fix formatting
make proto-format
```

### Generated code not updating
```bash
# Clean and regenerate
make clean
make generate
```

### Buf Studio can't connect
- Backend doesn't have gRPC implemented yet
- Currently using REST (HTTP) only
- See `docs/BUF_STUDIO_GUIDE.md` for gRPC setup

---

## 📚 Documentation

- Full Guide: `docs/BUF_STUDIO_GUIDE.md`
- Proto Files: `proto/*/v1/*.proto`
- Generated Docs: `make proto-docs` → `docs/proto/index.html`

---

## 💡 Tips

1. **Use proto-watch during development** for instant feedback
2. **Run proto-lint before commits** to catch issues early
3. **Check proto-breaking in CI/CD** to prevent accidental breaking changes
4. **Generate docs regularly** for team alignment
5. **Use Buf Studio** to design APIs before coding

---

## 🎓 Learn More

- [Buf Documentation](https://buf.build/docs)
- [gRPC Go Quickstart](https://grpc.io/docs/languages/go/quickstart/)
- [Protocol Buffers Guide](https://protobuf.dev/)
- [grpcurl GitHub](https://github.com/fullstorydev/grpcurl)
