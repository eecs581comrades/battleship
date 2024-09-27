trap 'trap - SIGTERM && kill -- -$$' SIGINT SIGTERM EXIT

npm run server&
npm run play&
npm run play second