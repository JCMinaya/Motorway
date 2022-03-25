import siege from 'siege'

siege()
  .on(3000)
  .concurrent(200)
  .get('http://localhost:3000/getPrice?id=0')
  .attack()