// pointsManager.js
// Quản lý điểm cho game chính và mở rộng cho game mini

export function getTotalPoints() {
  // TODO: Nếu có backend, thay thế bằng API lấy điểm từ server
  return Number(localStorage.getItem('totalPoints') || 0);
}

export function addPoints(points) {
  // TODO: Nếu có backend, thay thế bằng API cộng điểm
  const current = getTotalPoints();
  localStorage.setItem('totalPoints', current + points);
}

export function spendPoints(points) {
  // TODO: Nếu có backend, thay thế bằng API trừ điểm
  const current = getTotalPoints();
  localStorage.setItem('totalPoints', Math.max(0, current - points));
}

// TODO: Kết nối điểm với hệ thống vật phẩm game mini
// TODO: Khi mua vật phẩm, gọi spendPoints(points)
