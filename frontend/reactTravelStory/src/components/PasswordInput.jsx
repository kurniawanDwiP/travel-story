import React, { useState } from 'react';
import { FaRegEye, FaRegEyeSlash } from 'react-icons/fa';

const PasswordInput = ({ value, onChange, placeholder }) => {
	const [isShowPassword, setIsShowPassword] = useState(false);
	const toogleShowPassword = () => {
		setIsShowPassword(!isShowPassword);
	};

	return (
		<div className="flex bg-cyan-600/5 px-5 rounded mb-3 items-center">
			<input
				value={value}
				onChange={onChange}
				placeholder={placeholder || 'Password'}
				type={isShowPassword ? 'text' : 'password'}
				className="w-full text-sm bg-transparent py-3 mr-3 rounded outline-none"
			/>
			{isShowPassword ? (
				<FaRegEye
					size={22}
					className="text-primary cursor-pointer"
					onClick={() => toogleShowPassword()}
				/>
			) : (
				<FaRegEyeSlash
					size={22}
					className="text-slate-400 cursor-pointer"
					onClick={() => toogleShowPassword()}
				/>
			)}
		</div>
	);
};

export default PasswordInput;
