"use client";

import { useEffect, useState } from "react";

type User = {
	id: number;
	name: string;
	email: string;
	phone: string | null;
	created_at: string;
};

export default function UsersPage() {
	const [users, setUsers] = useState<User[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");

	useEffect(() => {
		async function loadUsers() {
			try {
				const response = await fetch("/api/admin/users");
				const data = await response.json();

				if (!response.ok || !data.success) {
					setError(data.message || "Failed to load users");
					return;
				}

				setUsers(data.users);
			} catch (loadError) {
				console.error("Load users error:", loadError);
				setError("Something went wrong while loading users");
			} finally {
				setLoading(false);
			}
		}

		loadUsers();
	}, []);

	return (
		<main className="mx-auto max-w-6xl">
			<div className="mb-8">
				<h1 className="text-3xl font-bold text-gray-900">Users</h1>
				<p className="mt-1 text-gray-500">
					View customers registered on the website.
				</p>
			</div>

			<div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
				<div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
					<p className="text-sm font-medium text-gray-500">Total users</p>
					<p className="mt-2 text-3xl font-bold text-gray-900">
						{loading ? "-" : users.length}
					</p>
				</div>
			</div>

			<section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
				<div className="border-b border-gray-200 px-5 py-4">
					<h2 className="text-lg font-bold text-gray-900">
						Registered users
					</h2>
				</div>

				{loading && (
					<p className="px-5 py-8 text-center text-gray-500">
						Loading users...
					</p>
				)}

				{!loading && error && (
					<p className="px-5 py-8 text-center text-red-600">{error}</p>
				)}

				{!loading && !error && users.length === 0 && (
					<p className="px-5 py-8 text-center text-gray-500">
						No registered users yet.
					</p>
				)}

				{!loading && !error && users.length > 0 && (
					<div className="overflow-x-auto">
						<table className="min-w-full text-left text-sm">
							<thead className="bg-gray-50 text-xs uppercase text-gray-500">
								<tr>
									<th className="px-5 py-3 font-semibold">Name</th>
									<th className="px-5 py-3 font-semibold">Email</th>
									<th className="px-5 py-3 font-semibold">Phone number</th>
									<th className="px-5 py-3 font-semibold">Registered</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-gray-100">
								{users.map((user) => (
									<tr key={user.id} className="text-gray-700">
										<td className="whitespace-nowrap px-5 py-4 font-medium text-gray-900">
											{user.name}
										</td>
										<td className="whitespace-nowrap px-5 py-4">
											{user.email}
										</td>
										<td className="whitespace-nowrap px-5 py-4">
											{user.phone ? (
												<div className="flex items-center gap-2">
													<span>{user.phone}</span>
													<a
														href={`https://wa.me/${getWhatsAppNumber(user.phone)}`}
														target="_blank"
														rel="noopener noreferrer"
														aria-label={`Open WhatsApp chat with ${user.name}`}
														title="Chat on WhatsApp"
														className="inline-flex items-center justify-center text-[#25D366] transition hover:text-[#128C7E]"
													>
														<svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 fill-current">
															<path d="M20.52 3.48A11.82 11.82 0 0 0 12.08 0C5.53 0 .2 5.33.2 11.88c0 2.1.55 4.15 1.59 5.97L.1 24l6.3-1.65a11.86 11.86 0 0 0 5.67 1.44h.01c6.55 0 11.88-5.33 11.88-11.88 0-3.18-1.24-6.17-3.44-8.43ZM12.08 21.75h-.01a9.84 9.84 0 0 1-5.02-1.37l-.36-.21-3.74.98 1-3.65-.23-.37a9.83 9.83 0 0 1-1.51-5.25C2.21 6.44 6.64 2.01 12.08 2.01c2.64 0 5.12 1.03 6.98 2.9a9.83 9.83 0 0 1 2.89 6.99c0 5.44-4.43 9.85-9.87 9.85Zm5.41-7.38c-.3-.15-1.78-.88-2.06-.98-.28-.1-.48-.15-.68.15-.2.3-.78.98-.96 1.18-.18.2-.35.22-.65.07-.3-.15-1.25-.46-2.38-1.47-.88-.78-1.47-1.74-1.64-2.04-.17-.3-.02-.46.13-.61.14-.14.3-.35.45-.53.15-.18.2-.3.3-.5.1-.2.05-.38-.02-.53-.08-.15-.68-1.64-.93-2.25-.24-.59-.49-.51-.68-.52h-.58c-.2 0-.53.07-.81.38-.28.3-1.06 1.04-1.06 2.54s1.09 2.95 1.24 3.15c.15.2 2.14 3.27 5.18 4.59.72.31 1.28.5 1.72.64.72.23 1.37.2 1.89.12.58-.09 1.78-.73 2.03-1.43.25-.7.25-1.3.18-1.43-.08-.13-.28-.2-.58-.35Z" />
														</svg>
													</a>
												</div>
											) : "Not provided"}
										</td>
										<td className="whitespace-nowrap px-5 py-4">
											{new Date(user.created_at).toLocaleDateString()}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}
			</section>
		</main>
	);
}

function getWhatsAppNumber(phone: string) {
	const digits = phone.replace(/\D/g, "");
	return digits.length === 10 ? `91${digits}` : digits;
}
