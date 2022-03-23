import siege from 'siege'

siege()
  .on(3000)
  .concurrent(100)
  .get('http://localhost:3000/getPrice?id=0&skipCache=0')
  .attack()