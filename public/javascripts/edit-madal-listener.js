const btnEdit = document.querySelectorAll('.btn-edit')
const editModal = document.querySelector('#editModal')

btnEdit.forEach(btn => {
  btn.addEventListener('click', e => {
    const btn = e.target.classList.contains('btn-edit')
      ? e.target
      : e.target.parentElement
    const { id, name, date } = btn.dataset
    editModal.innerHTML = `<div class='modal-dialog'>
    <div class='user-edit modal-content'>
      <form action='/accounts/${id}/edit' method='POST'>
        <div class='d-flex justify-content-between m-2'>
          <div class='edit-page-title d-flex align-items-center'>
            <button type='button' class='border border-0 bg-white' data-bs-dismiss='modal' aria-label='Close'>X</button>
            <span class='ms-4'>編輯帳戶</span>
          </div>
          <button type='submit' class='btn btn-info m-1'>儲存</button>
        </div>
        <div class="mb-3">
          <label for="name" class="mb-2">帳戶名稱</label>
          <input type="text" id="name" name="name" class="form-control" value="${ name }" required />
        </div>
        <div class="mb-3">
          <label for="date" class="mb-2">結帳日期</label>
          <input type="number" id="date" name="date" class="form-control" max="31" value="${ date }" required />
        </div>
      </form>
    </div>
  </div>`
  })
})