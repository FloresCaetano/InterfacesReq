import { useNavigate } from 'react-router-dom';

export default function NavigationTest() {
  const navigate = useNavigate();

  return (
    <div style={{ position: 'fixed', top: 10, right: 10, background: 'white', padding: '10px', border: '1px solid #ccc', zIndex: 1000 }}>
      <p>Navegación de prueba:</p>
      <button onClick={() => navigate('/')} style={{ margin: '5px' }}>
        Login
      </button>
      <button onClick={() => navigate('/dashboard')} style={{ margin: '5px' }}>
        Dashboard
      </button>
    </div>
  );
}
