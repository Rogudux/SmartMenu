import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonList, IonItem, IonIcon, IonLabel, IonButton,
  IonModal, IonInput, IonHeader, IonToolbar, IonTitle,
  IonContent, IonButtons, IonToast, IonSearchbar, IonSkeletonText } from '@ionic/angular/standalone';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Cliente } from '../../models/cliente';
import { ClienteService, CreateClienteDto, UpdateClienteDto } from '../../services/cliente.service';

@Component({
  selector: 'app-lista-clientes',
  standalone: true,
  templateUrl: './lista-clientes.component.html',
  styleUrls: ['./lista-clientes.component.scss'],
  imports: [IonSkeletonText, 
    CommonModule, ReactiveFormsModule,
    IonList, IonItem, IonIcon, IonLabel, IonButton,
    IonModal, IonInput, IonHeader, IonToolbar, IonTitle,
    IonContent, IonButtons, IonToast, IonSearchbar
  ],
})
export class ListaClientesComponent implements OnInit {
  private clienteSrv = inject(ClienteService);
  private fb = inject(FormBuilder);

  clientes: Cliente[] = [];
  loading = true;
  error = false;

  // UI
  query = '';

  // Modal/Form
  showModal = false;
  isEditing = false;
  editingId: number | null = null;
  form!: FormGroup;

  // Toast
  toastMsg = '';
  showToast = false;

  ngOnInit() {
    this.buildForm();
    this.load();
  }

  private buildForm() {
    this.form = this.fb.group({
      nombre: ['', [Validators.required, Validators.maxLength(120)]],
      telefono: ['', [Validators.required, Validators.maxLength(20)]],
      correoCliente: ['', [Validators.required, Validators.email, Validators.maxLength(160)]],
    });
  }

  load() {
    this.loading = true; this.error = false;
    this.clienteSrv.getAllClientes().subscribe({
      next: (data) => { this.clientes = (data ?? []).sort((a,b)=>a.nombre.localeCompare(b.nombre)); this.loading = false; },
      error: () => { this.error = true; this.loading = false; }
    });
  }
  reload() { this.load(); }

  onSearch(q: string) { this.query = (q || '').trim().toLowerCase(); }
  get listaFiltrada(): Cliente[] {
    if (!this.query) return this.clientes;
    const q = this.query;
    return this.clientes.filter(c =>
      (c.nombre || '').toLowerCase().includes(q) ||
      (c.telefono || '').toLowerCase().includes(q) ||
      (c.correoCliente || '').toLowerCase().includes(q)
    );
  }

  // —— Crear / Editar —— //
  abrirNuevo() {
    this.isEditing = false;
    this.editingId = null;
    this.form.reset({ nombre: '', telefono: '', correoCliente: '' });
    this.showModal = true;
  }

  abrirEditar(c: Cliente) {
    this.isEditing = true;
    this.editingId = c.id;
    this.form.setValue({
      nombre: c.nombre ?? '',
      telefono: c.telefono ?? '',
      correoCliente: c.correoCliente ?? '',
    });
    this.showModal = true;
  }

  cerrarModal() { this.showModal = false; }

  guardar() {
    if (this.form.invalid) return;
    const body = this.form.value as CreateClienteDto;

    if (this.isEditing) {
      if (this.editingId == null) return;
      this.clienteSrv.updateCliente(this.editingId, body as UpdateClienteDto).subscribe({
        next: (upd) => {
          const idx = this.clientes.findIndex(x => x.id === upd.id);
          if (idx > -1) this.clientes[idx] = upd;
          this.clientes = [...this.clientes].sort((a,b)=>a.nombre.localeCompare(b.nombre));
          this.toast('Cliente actualizado');
          this.cerrarModal();
        },
        error: () => this.toast('Error al actualizar'),
      });
    } else {
      this.clienteSrv.createCliente(body).subscribe({
        next: (created) => {
          this.clientes = [created, ...this.clientes].sort((a,b)=>a.nombre.localeCompare(b.nombre));
          this.toast('Cliente creado');
          this.cerrarModal();
        },
        error: () => this.toast('Error al crear'),
      });
    }
  }

  eliminar(c: Cliente) {
    if (!confirm(`¿Eliminar a "${c.nombre}"?`)) return;
    this.clienteSrv.deleteCliente(c.id).subscribe({
      next: () => {
        this.clientes = this.clientes.filter(x => x.id !== c.id);
        this.toast('Cliente eliminado');
      },
      error: () => this.toast('Error al eliminar'),
    });
  }

  private toast(msg: string) {
    this.toastMsg = msg;
    this.showToast = true;
    setTimeout(() => (this.showToast = false), 1600);
  }

  trackById(_i: number, c: Cliente) { return c.id; }
}
