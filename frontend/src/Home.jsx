import './index.css'
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

function Home({ loggedIn, username }) {
  return (
    <div className="Home">
      <p>Hello, {username}</p>
    </div>
  )
}

export default Home