import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import IconPlusLabel from './Labels/IconPlusLabel'
import SearchTextField from './SearchTextField'

import '@styles/components/HeaderFooter.css'

export default function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const navigate = useNavigate();

  // 토큰 확인
  // 나중에 좀 변경해야할 수 있음 
  useEffect(() => {
    // 토큰 체크 하고
    const token = true 
    // 설정 
    setIsLoggedIn(token)
  }, []);

  const handleLoginLogout = () => {
    if (isLoggedIn) {

    } else {

    }
    
    setIsLoggedIn(!isLoggedIn)
  };

  const handleMypage = () => {
    if (isLoggedIn) {

    } else {

    }
    setIsLoggedIn(!isLoggedIn)
  };

  const handleSearch = (searchText) => {
    navigate('/viewSearchResult', { state: {searchText: searchText} })
  }

  const options = [
    {
      icon: "/src/assets/comunity.png",
      text: "커뮤니티", 
      onClick: null,
    }, 
    {
      icon: "/src/assets/mypage.png",
      text: "마이페이지",
      onClick: handleMypage,
    },
    {
      icon: isLoggedIn
        ? "/src/assets/login.png" 
        : "/src/assets/logout.png", 
      text: isLoggedIn ? "로그인" : "로그아웃", 
      onClick: handleLoginLogout,
    },
  ];

  return(
    <div className='header_container'>
      <div className='header_container_logo'>
        <IconPlusLabel icon={'/src/assets/duck.png'} text={'덕션'} />
      </div>
      <div className='header_container_searchField'>
        <SearchTextField placeholder={'검색어 입력하시든가 말든가'} onSearch={(searchText) => handleSearch(searchText)} />
      </div>
      <div className='header_container_options'>
        {options.map((item, index) => (
          <IconPlusLabel key={index} icon={item.icon} text={item.text} onClick={item.onClick}/>
        ))}
      </div>
    </div>
  )
}