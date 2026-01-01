@echo off
echo Setting up Database...
cd backend
call npm install
call npx prisma generate
call npx prisma db push
echo Database setup complete. Starting backend...
call npm run start:dev
pause
