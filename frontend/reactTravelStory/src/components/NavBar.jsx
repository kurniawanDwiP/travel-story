import React from 'react';
import LOGO from '../assets/images/logo.svg';
import ProfileInfo from './ProfileInfo';
import { useNavigate } from 'react-router-dom';

const NavBar = ({ userInfo }) => {


	const isToken=localStorage.getItem('token')
	const navigate = useNavigate()
	const onLogout = () => {
		localStorage.clear();
		navigate('/login');
	};

	return (
		<div className="bg-white flex items-center justify-between px-6 py-2 drop-shadow sticky top-0 z-10">
			<div className="flex items-center justify-center gap-2">
				<img className="w-10 h-10 bg-black rounded-md" src={LOGO} alt="logo" />
				<h2 className="font-pacifico font-semibold text-3xl">
					Your Travel Journal
				</h2>
			</div>
			{isToken && <ProfileInfo userInfo={userInfo} onLogout={onLogout} />}
		</div>
	);
};

export default NavBar;
